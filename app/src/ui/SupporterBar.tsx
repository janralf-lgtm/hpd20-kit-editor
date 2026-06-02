import { useState } from "react";
import { useT } from "../i18n";
import { openExternal } from "../platform/links";
import { KOFI_URL, redeemCode } from "../supporter";

/** Donation strip shown to non-supporters; opens a small redeem dialog. */
export function SupporterBar({ onRedeemed }: { onRedeemed: () => void }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);

  const submit = async () => {
    if (await redeemCode(code)) {
      setOpen(false);
      onRedeemed();
    } else {
      setErr(true);
    }
  };

  return (
    <div className="support-bar">
      <span className="support-text">☕ {t("support.hint")}</span>
      <button className="support-cta" onClick={() => openExternal(KOFI_URL)}>
        {t("support.cta")}
      </button>
      <button
        className="support-redeem"
        onClick={() => {
          setErr(false);
          setCode("");
          setOpen(true);
        }}
      >
        {t("support.redeem")}
      </button>

      {open && (
        <div className="picker-overlay" onClick={() => setOpen(false)}>
          <div className="redeem-dialog" onClick={(e) => e.stopPropagation()}>
            <label>{t("support.enterCode")}</label>
            <input
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {err && <div className="redeem-err">{t("support.invalid")}</div>}
            <div className="redeem-actions">
              <button onClick={() => setOpen(false)}>{t("scale.cancel")}</button>
              <button className="primary" onClick={submit}>
                {t("support.redeem")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
