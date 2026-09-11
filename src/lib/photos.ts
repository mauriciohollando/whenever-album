import type { AlbumPhoto, PhotoVersion } from "./types";

export function photoVersions(photo: AlbumPhoto): PhotoVersion[] {
  if (photo.versions?.length) return photo.versions;
  if (!photo.imageUrl) return [];
  return [
    {
      id: "ver_original",
      url: photo.imageUrl,
      prompt: photo.description,
      createdAt: "",
      kind: "original",
    },
  ];
}

export function selectedVersion(photo: AlbumPhoto): PhotoVersion | undefined {
  const versions = photoVersions(photo);
  if (photo.selectedVersionId) {
    return versions.find((item) => item.id === photo.selectedVersionId) || versions.at(-1);
  }
  return versions.at(-1);
}

export function photoUrl(photo: AlbumPhoto): string | null {
  return selectedVersion(photo)?.url || photo.imageUrl;
}

export function withSelectedVersion(photo: AlbumPhoto, versionId: string): AlbumPhoto {
  const versions = photoVersions(photo);
  const version = versions.find((item) => item.id === versionId);
  if (!version) return photo;
  return {
    ...photo,
    versions,
    selectedVersionId: version.id,
    imageUrl: version.url,
  };
}

export function findAlbumPhoto(
  pages: Array<{ photos: AlbumPhoto[] }>,
  photoId: string
): { pageIndex: number; photoIndex: number; photo: AlbumPhoto } | null {
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const photoIndex = pages[pageIndex].photos.findIndex((item) => item.id === photoId);
    if (photoIndex >= 0) {
      return { pageIndex, photoIndex, photo: pages[pageIndex].photos[photoIndex] };
    }
  }
  return null;
}
