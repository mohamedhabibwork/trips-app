// SCR-PUB-05 Photographer sign-up: details on the left, the portfolio grid on the right. At least
// eight photos are required before the application can be submitted.
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextField } from "@/components/kit/controls";
import { PageIntro, PageMain, Panel, PanelTitle, TwoColumns } from "@/components/kit/layout";
import { orpc } from "@/utils/orpc";

import { uploadApplicationDocuments } from "../common/application-documents";
import { CountrySelect } from "../common/country-select";
import { SupplierPasswordField, splitList } from "./supplier-fields";
import { useSupplierOnboarding } from "./supplier-onboarding";

const MIN_PORTFOLIO_PHOTOS = 8;
const MAX_PORTFOLIO_PHOTOS = 200;
const MAX_YEARS = 60;

interface PortfolioPhoto {
  file: File;
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
    const known = new Set(photos.map((photo) => photo.file.name));
    const added = files
      .filter((file) => !known.has(file.name))
      .map((file): PortfolioPhoto => {
        const previewUrl = URL.createObjectURL(file);
        urls.current = [...urls.current, previewUrl];
        return { file, previewUrl };
      });
    setPhotos((current) => [...current, ...added]);
  }

  function remove(name: string) {
    setPhotos((current) => current.filter((photo) => photo.file.name !== name));
  }

  return { photos, add, remove };
}

/** Photographer application. Access starts after approval; the status page follows submission. */
export function PhotographerSignUp() {
  const { t } = useAuth();
  const onboarding = useSupplierOnboarding(
    "platform_photographer",
    "screen.public.signUp.photographer.submitFailed",
  );
  const [country, setCountry] = useState("");
  const { photos, add, remove } = usePortfolio();
  const { submitting } = onboarding;
  const portfolioReady =
    photos.length >= MIN_PORTFOLIO_PHOTOS && photos.length <= MAX_PORTFOLIO_PHOTOS;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!portfolioReady || country.length === 0) return;
    const formData = new FormData(event.currentTarget);
    const read = (name: string) => String(formData.get(name) ?? "").trim();
    const files = photos.map((photo) => photo.file);

    void onboarding.start(
      {
        fullName: read("displayName"),
        email: read("email"),
        phone: read("phone"),
        password: String(formData.get("password") ?? ""),
      },
      async () =>
        orpc.onboarding.submitPhotographerApplication.call({
          nationalId: read("nationalId"),
          yearsOfExperience: Number(read("yearsOfExperience")),
          cameraBodies: splitList(read("cameraBodies")),
          lenses: splitList(read("lenses")),
          serviceRegions: [country],
          specialties: splitList(read("specialties")),
          portfolioPhotoCount: files.length,
          documents: await uploadApplicationDocuments(files, "portfolio_sample"),
        }),
    );
  }

  return (
    <>
      {onboarding.panel}
      <PageMain className={onboarding.verifying ? "hidden" : undefined}>
        <PageIntro
          title={t("screen.public.signUp.photographer.title")}
          description={t("screen.public.signUp.photographer.lead")}
        />
        <form onSubmit={handleSubmit}>
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
              <SupplierPasswordField disabled={submitting} />
              <CountrySelect value={country} onChange={setCountry} disabled={submitting} />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <TextField
                  name="nationalId"
                  dir="ltr"
                  label={t("screen.public.signUp.photographer.nationalId")}
                  required
                  minLength={6}
                  maxLength={30}
                  disabled={submitting}
                />
                <TextField
                  name="yearsOfExperience"
                  type="number"
                  inputMode="numeric"
                  label={t("screen.public.signUp.photographer.yearsOfExperience")}
                  min={0}
                  max={MAX_YEARS}
                  step={1}
                  required
                  disabled={submitting}
                />
              </div>
              <TextField
                name="cameraBodies"
                label={t("screen.public.signUp.photographer.cameraBodies")}
                hint={t("screen.public.signUp.photographer.listHint")}
                required
                minLength={2}
                disabled={submitting}
              />
              <TextField
                name="lenses"
                label={t("screen.public.signUp.photographer.lenses")}
                hint={t("screen.public.signUp.photographer.listHint")}
                disabled={submitting}
              />
              <TextField
                name="specialties"
                label={t("screen.public.signUp.photographer.specialties")}
                hint={t("screen.public.signUp.photographer.listHint")}
                required
                minLength={2}
                disabled={submitting}
              />
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
                  <li key={photo.file.name} className="relative aspect-square">
                    <img
                      src={photo.previewUrl}
                      alt={photo.file.name}
                      className="size-full rounded-[var(--te-radius-sm)] object-cover"
                    />
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => remove(photo.file.name)}
                      aria-label={t("screen.public.common.documentDrop.removeFile", {
                        name: photo.file.name,
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
              {onboarding.errorMessage ? (
                <Notice tone="danger">{onboarding.errorMessage}</Notice>
              ) : null}
              <Button
                type="submit"
                disabled={!portfolioReady || country.length === 0 || submitting}
              >
                {submitting
                  ? t("screen.public.signUp.photographer.submitting")
                  : t("screen.public.signUp.photographer.submit")}
              </Button>
            </Panel>
          </TwoColumns>
        </form>
      </PageMain>
    </>
  );
}
