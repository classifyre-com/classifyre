"""Unit tests for the Microsoft 365 source."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from src.sources.microsoft_365.source import (
    DriveItemRef,
    DriveRef,
    Microsoft365Source,
    SiteRef,
    _extract_user_name,
)


def _base_recipe(
    auth_mode: str = "CLIENT_SECRET",
    **overrides: object,
) -> dict:
    if auth_mode == "CLIENT_SECRET":
        required = {
            "auth_mode": "CLIENT_SECRET",
            "tenant_id": "tenant-1",
            "client_id": "client-1",
        }
        masked = {"client_secret": "secret-1"}
    elif auth_mode == "CERTIFICATE":
        required = {
            "auth_mode": "CERTIFICATE",
            "tenant_id": "tenant-1",
            "client_id": "client-1",
        }
        masked = {"certificate_pem": "-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----"}
    elif auth_mode == "MANAGED_IDENTITY":
        required = {"auth_mode": "MANAGED_IDENTITY"}
        masked = {}
    else:
        raise ValueError(f"Unknown auth_mode: {auth_mode}")

    recipe: dict = {
        "type": "MICROSOFT_365",
        "required": required,
        "masked": masked,
        "sampling": {"strategy": "LATEST"},
        **overrides,
    }
    return recipe


class TestAuthValidation:
    def test_client_secret_valid(self) -> None:
        source = Microsoft365Source(_base_recipe("CLIENT_SECRET"))
        assert source.source_type == "microsoft_365"

    def test_certificate_valid(self) -> None:
        source = Microsoft365Source(_base_recipe("CERTIFICATE"))
        assert source.config.required.auth_mode == "CERTIFICATE"

    def test_managed_identity_valid(self) -> None:
        source = Microsoft365Source(_base_recipe("MANAGED_IDENTITY"))
        assert source.config.required.auth_mode == "MANAGED_IDENTITY"

    def test_mismatched_auth_raises(self) -> None:
        recipe = {
            "type": "MICROSOFT_365",
            "required": {
                "auth_mode": "CLIENT_SECRET",
                "tenant_id": "t",
                "client_id": "c",
            },
            "masked": {"certificate_pem": "bad"},
            "sampling": {"strategy": "LATEST"},
        }
        with pytest.raises(Exception):
            Microsoft365Source(recipe)


class TestSampling:
    def _make_items(self, count: int) -> list[DriveItemRef]:
        from datetime import UTC, datetime, timedelta

        base = datetime(2025, 1, 1, tzinfo=UTC)
        return [
            DriveItemRef(
                item_id=f"item-{i}",
                name=f"file-{i}.pdf",
                path=f"/docs/file-{i}.pdf",
                size=1000 * (i + 1),
                last_modified=base + timedelta(days=i),
                mime_type="application/pdf",
                web_url=f"https://example.com/file-{i}",
                etag=None,
                created_by=None,
                modified_by=None,
                drive_id="drive-1",
                drive_name="Documents",
                site_name="Test Site",
                ecosystem="sharepoint_sites",
            )
            for i in range(count)
        ]

    def test_latest_returns_most_recent(self) -> None:
        recipe = _base_recipe(sampling={"strategy": "LATEST", "rows_per_page": 10})
        source = Microsoft365Source(recipe)
        items = self._make_items(20)
        sampled = source._apply_sampling(items)
        assert len(sampled) == 10
        assert sampled[0].item_id == "item-19"

    def test_random_returns_limited(self) -> None:
        recipe = _base_recipe(sampling={"strategy": "RANDOM", "rows_per_page": 10})
        source = Microsoft365Source(recipe)
        items = self._make_items(20)
        sampled = source._apply_sampling(items)
        assert len(sampled) == 10

    def test_random_is_deterministic(self) -> None:
        recipe = _base_recipe(sampling={"strategy": "RANDOM", "rows_per_page": 10})
        source = Microsoft365Source(recipe)
        items = self._make_items(20)
        sampled1 = source._apply_sampling(items)
        sampled2 = source._apply_sampling(items)
        assert [s.item_id for s in sampled1] == [s.item_id for s in sampled2]

    def test_all_returns_everything(self) -> None:
        recipe = _base_recipe(sampling={"strategy": "ALL"})
        source = Microsoft365Source(recipe)
        items = self._make_items(10)
        sampled = source._apply_sampling(items)
        assert len(sampled) == 10


class TestExtensionFiltering:
    def test_include_extensions(self) -> None:
        recipe = _base_recipe(
            optional={"scope": {"include_extensions": [".pdf", ".docx"]}}
        )
        source = Microsoft365Source(recipe)
        assert source._matches_extension_filters("report.pdf")
        assert source._matches_extension_filters("doc.docx")
        assert not source._matches_extension_filters("image.png")

    def test_exclude_extensions(self) -> None:
        recipe = _base_recipe(
            optional={"scope": {"exclude_extensions": [".mp4", ".mov"]}}
        )
        source = Microsoft365Source(recipe)
        assert source._matches_extension_filters("report.pdf")
        assert not source._matches_extension_filters("video.mp4")

    def test_no_filters_allows_all(self) -> None:
        source = Microsoft365Source(_base_recipe())
        assert source._matches_extension_filters("anything.xyz")


class TestHashGeneration:
    def test_hash_is_deterministic(self) -> None:
        source = Microsoft365Source(_base_recipe())
        h1 = source.generate_hash_id("m365_file_#_drive-1_#_item-1")
        h2 = source.generate_hash_id("m365_file_#_drive-1_#_item-1")
        assert h1 == h2

    def test_different_ids_produce_different_hashes(self) -> None:
        source = Microsoft365Source(_base_recipe())
        h1 = source.generate_hash_id("m365_file_#_drive-1_#_item-1")
        h2 = source.generate_hash_id("m365_file_#_drive-1_#_item-2")
        assert h1 != h2


class TestConfigAccessors:
    def test_default_ecosystems(self) -> None:
        source = Microsoft365Source(_base_recipe())
        assert source._ecosystems() == ["sharepoint_sites"]

    def test_custom_ecosystems(self) -> None:
        recipe = _base_recipe(
            optional={"scope": {"ecosystems": ["onedrive", "teams_files"]}}
        )
        source = Microsoft365Source(recipe)
        ecosystems = source._ecosystems()
        assert "onedrive" in ecosystems
        assert "teams_files" in ecosystems

    def test_default_page_size(self) -> None:
        source = Microsoft365Source(_base_recipe())
        assert source._page_size() == 200

    def test_custom_page_size(self) -> None:
        recipe = _base_recipe(optional={"connection": {"page_size": 500}})
        source = Microsoft365Source(recipe)
        assert source._page_size() == 500

    def test_max_object_bytes_default(self) -> None:
        source = Microsoft365Source(_base_recipe())
        assert source._max_object_bytes() == 104857600


class TestUserNameExtraction:
    def test_extracts_display_name(self) -> None:
        assert _extract_user_name({"user": {"displayName": "John"}}) == "John"

    def test_extracts_email(self) -> None:
        assert _extract_user_name({"user": {"email": "j@e.com"}}) == "j@e.com"

    def test_returns_none_for_missing(self) -> None:
        assert _extract_user_name(None) is None
        assert _extract_user_name({}) is None


class TestAssetMetadataContract:
    def test_file_metadata_validates(self) -> None:
        source = Microsoft365Source(_base_recipe())
        result = source.metadata_fields("file", {
            "drive_name": "Documents",
            "item_path": "/test.pdf",
            "ecosystem": "sharepoint_sites",
            "size_bytes": 1024,
            "mime_type": "application/pdf",
        })
        assert result["asset_kind"] == "file"
        assert result["metadata"]["drive_name"] == "Documents"

    def test_site_metadata_validates(self) -> None:
        source = Microsoft365Source(_base_recipe())
        result = source.metadata_fields("site", {
            "site_id": "site-1",
            "site_name": "Test Site",
            "site_url": "https://example.sharepoint.com",
            "drive_count": 3,
        })
        assert result["asset_kind"] == "site"

    def test_drive_metadata_validates(self) -> None:
        source = Microsoft365Source(_base_recipe())
        result = source.metadata_fields("drive", {
            "drive_id": "drive-1",
            "drive_name": "Documents",
            "drive_type": "documentLibrary",
        })
        assert result["asset_kind"] == "drive"
