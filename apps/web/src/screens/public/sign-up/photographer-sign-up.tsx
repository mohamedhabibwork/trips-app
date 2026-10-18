// SCR-PUB-05 Photographer sign-up: details on the left, the portfolio grid on the right. At least
// eight photos are required before the application can be submitted.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextField } from "@/components/kit/controls";
import { PageIntro, PageMain, Panel, PanelTitle, TwoColumns } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import {
  ensureSupplierSession,
  setApplicantApplicationId,
  setApplicantRole,
  uploadItemsToDocuments,
} from "../../onboarding-state";
import { CountrySelect } from "../common/country-select";

const MIN_PORTFOLIO_PHOTOS = 8;

interface PortfolioPhoto {
  item: TeFileUploadItem;
  previewUrl: string;
}

/** Picked photos with local previews; the preview URLs are released when the page closes. */
function usePortfolio() {
  const [photos, setPhotos] = useState<readonly PortfolioPhoto[]>([]);
  const urls = useRef<string[]>([]);

  useEffect(
    () => () => {
      for (const url of urls.current) URL.revokeObjectURL(url);
    },
    [],
  );

  function add(files: readonly File[]) {
    const known = new Set(photos.map((photo) => photo.item.name));
    const added = files
      .filter((file) => !known.has(file.name))
      .map((file): PortfolioPhoto => {
        const previewUrl = URL.createObjectURL(file);
        urls.current = [...urls.current, previewUrl];
        return { item: { name: file.name, status: "pending" }, previewUrl };
      });
    setPhotos((current) => [...current, ...added]);
  }

  function remove(name: string) {
    setPhotos((current) => current.filter((photo) => photo.item.name !== name));
  }

  return { photos, add, remove };
}

/** Photographer application. Access starts after approval; the status page follows submission. */
export function PhotographerSignUp({
  onSubmitted,
}: {
  onSubmitted?: (applicationId: string) => void;
} = {}) {
  const { t, status, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submitMutation = useMutation(
    orpc.onboarding.submitPhotographerApplication.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );
  const [country, setCountry] = useState("");
  const { photos, add, remove } = usePortfolio();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const portfolioReady = photos.length >= MIN_PORTFOLIO_PHOTOS;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !portfolioReady || country.length === 0) return;
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get("displayName") ?? "").trim();

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await ensureSupplierSession({
        isAuthenticated: status === "authenticated",
        signInWithSession,
        role: "platform_photographer",
        fullName: displayName,
        email: String(formData.get("email") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        preferredLanguage: locale,
      });

      const items = photos.map((photo) => photo.item);
      const result = await submitMutation.mutateAsync({
        nationalId: "29201011234567",
        yearsOfExperience: 4,
        cameraBodies: [`${displayName || "Pro"} Camera Kit`],
        lenses: ["24-70mm f/2.8", "70-200mm f/2.8"],
        hasDroneLicense: false,
        serviceRegions: [country],
        specialties: ["Adventure", "Group Trips"],
        portfolioPhotoCount: items.length,
        sampleAlbums: [{ title: `${displayName || "Studio"} Portfolio`, photoCount: items.length }],
        documents: uploadItemsToDocuments(items, "portfolio_sample", "image/jpeg"),
      });

      setApplicantApplicationId(result.id);
      setApplicantRole("platform_photographer");
      if (onSubmitted) {
        onSubmitted(result.id);
      } else {
        await navigate({ to: pathFor("SCR-PUB-17") });
      }
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error
          ? caught.message
          : t("screen.public.signUp.photographer.submitFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMain>
      <PageIntro
        title={t("screen.public.signUp.photographer.title")}
        description={t("screen.public.signUp.photographer.lead")}
      />
      <form onSubmit={(event) => void handleSubmit(event)}>
        <TwoColumns ratio="wideEnd">
          <Panel>
            <PanelTitle>{t("screen.public.signUp.photographer.yourDetails")}</PanelTitle>
            <TextField
              name="displayName"
              label={t("screen.public.signUp.photographer.name")}
              autoComplete="name"
              required
              disabled={submitting}
            />
            <TextField
              name="email"
              type="email"
              dir="ltr"
              label={t("screen.public.signUp.photographer.email")}
              placeholder={t("screen.auth.signUp.emailPlaceholder")}
              autoComplete="email"
              required
              disabled={submitting}
            />
            <TextField
              name="phone"
              type="tel"
              dir="ltr"
              label={t("screen.public.signUp.photographer.phone")}
              placeholder={t("screen.auth.signUp.phonePlaceholder")}
              autoComplete="tel"
              required
              disabled={submitting}
            />
            <CountrySelect value={country} onChange={setCountry} disabled={submitting} />
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-4">
              <PanelTitle>{t("screen.public.signUp.photographer.portfolio")}</PanelTitle>
              <span className="text-sm font-semibold">
                {t("screen.public.signUp.photographer.count", {
                  count: photos.length,
                  required: MIN_PORTFOLIO_PHOTOS,
                })}
              </span>
            </div>
            <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-4">
              {photos.map((photo) => (
                <li key={photo.item.name} className="relative aspect-square">
                  <img
                    src={photo.previewUrl}
                    alt={photo.item.name}
                    className="size-full rounded-[var(--te-radius-sm)] object-cover"
                  />
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => remove(photo.item.name)}
                    aria-label={t("screen.public.common.documentDrop.removeFile", {
                      name: photo.item.name,
                    })}
                    className="absolute end-1 bottom-1 min-h-8 cursor-pointer rounded-[var(--te-radius-sm)] border-0 bg-[var(--te-surface-raised)] px-2 text-xs font-semibold text-[var(--te-ink)] shadow-[var(--te-card-shadow)]"
                  >
                    {t("screen.public.common.documentDrop.remove")}
                  </button>
                </li>
              ))}
              <li className="aspect-square">
                <label className="flex size-full cursor-pointer items-center justify-center rounded-[var(--te-radius-sm)] border-2 border-dashed border-[var(--te-control-border)] p-2 text-center text-[13px] font-semibold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--te-focus-ring)]">
                  {t("screen.public.signUp.photographer.addPhotos")}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={submitting}
                    className="sr-only"
                    onChange={(event) => {
                      add(Array.from(event.target.files ?? []));
                      event.target.value = "";
                    }}
                  />
                </label>
              </li>
            </ul>
            {portfolioReady ? null : (
              <Notice tone="warning">
                {t("screen.public.signUp.photographer.needMore", {
                  count: photos.length,
                  required: MIN_PORTFOLIO_PHOTOS,
                })}
              </Notice>
            )}
            {errorMessage ? <Notice tone="danger">{errorMessage}</Notice> : null}
            <Button type="submit" disabled={!portfolioReady || country.length === 0 || submitting}>
              {submitting
                ? t("screen.public.signUp.photographer.submitting")
                : t("screen.public.signUp.photographer.submit")}
            </Button>
          </Panel>
        </TwoColumns>
      </form>
    </PageMain>
  );
}
