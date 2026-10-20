// SCR-PHO-10 Watermark settings: the per-album watermark panel of the privacy artboard
// (docs/design/web/PhoWebPrivacy.dc.html). It is a component of SCR-PHO-09 (the canvas folds it
// into the privacy page), so it has no URL of its own. The watermark state is real
// (trip_photo_albums.watermarked); changing it needs an update procedure that does not exist yet,
// so the switch renders the stored value with an honest note.
import { useAuth } from "@/auth/auth-context";

import { NO_VALUE, StudioNotice } from "../studio-ui";
import { useStudioPlan } from "../studio-plan";

interface WatermarkSettingsProps {
  /** The album's stored watermark flag. */
  watermarked: boolean;
  /** True while the plan context is still loading; the gate renders unknown then. */
  loading?: boolean;
}

export function WatermarkSettings({ watermarked, loading = false }: WatermarkSettingsProps) {
  const { t } = useAuth();
  const plan = useStudioPlan();
  const allowed = plan.watermarkAllowed;

  return (
    <section
      aria-labelledby="studio-watermark-heading"
      className="flex min-w-0 flex-col gap-3 rounded-[var(--te-radius-lg)] bg-[var(--te-surface-raised)] p-5"
    >
      <span className="flex items-center gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 id="studio-watermark-heading" className="m-0 text-xl font-semibold">
            {t("screen.studio.watermark.title")}
          </h2>
          <span className="text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.studio.watermark.caption")}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={watermarked}
          aria-labelledby="studio-watermark-heading"
          disabled={true}
          className={`flex h-8 w-[52px] shrink-0 cursor-not-allowed items-center rounded-full border-0 p-1 ${
            watermarked
              ? "justify-end bg-[var(--te-ink)]"
              : "justify-start bg-[var(--te-control-border)]"
          } ${allowed ? "" : "bg-[var(--te-hairline)]"}`}
        >
          <span aria-hidden="true" className="block size-6 rounded-full bg-white" />
        </button>
      </span>

      <div
        role="img"
        aria-label={t(
          watermarked ? "screen.studio.watermark.previewOn" : "screen.studio.watermark.previewOff",
        )}
        className="relative aspect-[4/3] overflow-hidden rounded-[var(--te-radius-lg)] bg-[var(--te-ink)]"
      >
        {watermarked && !loading ? (
          <span
            aria-hidden="true"
            className="absolute bottom-[3%] right-[3%] flex size-[12%] items-center justify-center rounded-full bg-white/30"
          >
            <span className="block size-1/2 rounded-full border-2 border-white" />
          </span>
        ) : null}
        {loading ? null : !allowed ? (
          <span className="absolute inset-0 flex items-center justify-center bg-[rgba(16,18,48,0.55)]">
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-[var(--te-ink)]">
              {t("screen.studio.watermark.planLocked")}
            </span>
          </span>
        ) : null}
      </div>

      <dl className="m-0 grid grid-cols-3 gap-2">
        <Fact
          label={t("screen.studio.watermark.position")}
          value={t("screen.studio.watermark.positionValue")}
        />
        <Fact
          label={t("screen.studio.watermark.inset")}
          value={t("screen.studio.watermark.insetValue")}
        />
        <Fact
          label={t("screen.studio.watermark.opacity")}
          value={t("screen.studio.watermark.opacityValue")}
        />
      </dl>

      <span className="flex items-start gap-2 text-sm leading-5 text-[var(--te-ink-muted)]">
        {t("screen.studio.watermark.note")}
      </span>

      {loading ? null : !allowed ? (
        <StudioNotice tone="warn" title={t("screen.studio.watermark.upgradeTitle")}>
          <p className="m-0 text-sm leading-5">{t("screen.studio.watermark.upgradeBody")}</p>
        </StudioNotice>
      ) : (
        <StudioNotice tone="info" title={t("screen.studio.watermark.readOnlyTitle")}>
          <p className="m-0 text-sm leading-5">{t("screen.studio.watermark.readOnlyBody")}</p>
        </StudioNotice>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--te-radius-md)] bg-[var(--te-surface)] px-3 py-2.5">
      <dt className="text-xs text-[var(--te-ink-muted)]">{label}</dt>
      <dd className="m-0 mt-0.5 text-sm font-semibold">{value || NO_VALUE}</dd>
    </div>
  );
}
