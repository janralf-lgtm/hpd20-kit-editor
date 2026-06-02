import { useT, LANGS, type Lang } from "../i18n";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useT();
  return (
    <select
      className="lang-switch"
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      title={t("lang.label")}
      aria-label={t("lang.label")}
    >
      {LANGS.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
