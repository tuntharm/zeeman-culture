import React, { useId, useMemo, useState } from "react";
import { useClient } from "sanity";
import { imageUrl } from "../../lib/content.mjs";
import { coverPhotoSize, renderCover } from "../../lib/cover.mjs";
import "../studio.css";

export default function CoverInput(props) {
  const client = useClient({ apiVersion: "2026-10-01" });
  const { projectId, dataset } = client.config();
  const instanceId = useId();
  const [previewSize, setPreviewSize] = useState("article");
  const cover = props.value || {};
  const custom = cover.template === "custom";
  const preview = useMemo(() => {
    let photoUrl = "";
    let photoError = false;
    const source = custom ? cover.customImage : cover.photo;
    if (source?.asset) {
      try {
        photoUrl =
          imageUrl(source, {
            projectId,
            dataset,
            ...coverPhotoSize(cover.template),
          }) || "";
        photoError = !photoUrl;
      } catch {
        photoError = true;
      }
    }
    return {
      svg: renderCover(cover, { photoUrl, idPrefix: `${instanceId}-preview` }),
      photoError,
    };
  }, [cover, custom, projectId, dataset, instanceId]);

  return (
    <div className="zeeman-cover-input">
      {props.renderDefault(props)}
      <section className="zeeman-cover-preview" aria-label="Live cover preview">
        <div className="zeeman-preview-header">
          <div>
            <h3>Your cover</h3>
            <p>Updates as you edit. The website uses this same design.</p>
          </div>
          <div
            className="zeeman-preview-sizes"
            role="group"
            aria-label="Preview size"
          >
            <button
              type="button"
              aria-pressed={previewSize === "article"}
              onClick={() => setPreviewSize("article")}
            >
              Article cover
            </button>
            <button
              type="button"
              aria-pressed={previewSize === "card"}
              onClick={() => setPreviewSize("card")}
            >
              Homepage card
            </button>
          </div>
        </div>
        <div
          className={`zeeman-cover-art zeeman-cover-art--${previewSize}`}
          dangerouslySetInnerHTML={{ __html: preview.svg }}
        />
        {preview.photoError && (
          <p className="zeeman-preview-note" role="status">
            Your photo preview is not ready. Finish uploading the image, then
            check it here.
          </p>
        )}
        {!custom && (!cover.phraseA?.trim() || !cover.phraseB?.trim()) && (
          <p className="zeeman-preview-note">
            Example wording appears until you enter your own phrases.
          </p>
        )}
        <p className="zeeman-preview-note">
          {custom
            ? "Upload a finished JPG, PNG or WebP cover. Recommended: 1200 × 900 px (4:3). Other proportions are cropped to fit; check that your text stays inside the preview."
            : "Use the photo’s crop and focal-point controls to change what appears in its frame."}
        </p>
      </section>
    </div>
  );
}
