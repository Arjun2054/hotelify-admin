import { useUnitStore } from "@/store/room/unitStore";
import type { CreateUnitForm, Unit } from "@/types/room-types";
import { useState, useEffect } from "react";
import { Button, Input } from "../shared/Formfields";

const COMMON_UNITS = [
  { name: "Piece", abbreviation: "pcs" },
  { name: "Kilogram", abbreviation: "kg" },
  { name: "Gram", abbreviation: "g" },
  { name: "Litre", abbreviation: "L" },
  { name: "Millilitre", abbreviation: "mL" },
  { name: "Box", abbreviation: "box" },
  { name: "Pack", abbreviation: "pk" },
  { name: "Dozen", abbreviation: "doz" },
  { name: "Roll", abbreviation: "roll" },
  { name: "Set", abbreviation: "set" },
];

interface UnitFormProps {
  unit?: Unit;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UnitForm({ unit, onSuccess, onCancel }: UnitFormProps) {
  const { createUnit, updateUnit, isSubmitting, error, clearError } =
    useUnitStore();
  const [form, setForm] = useState<CreateUnitForm>(
    unit
      ? { name: unit.name, abbreviation: unit.abbreviation }
      : { name: "", abbreviation: "" },
  );
  const [errors, setErrors] = useState<Partial<CreateUnitForm>>({});

  useEffect(() => () => clearError(), []);

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.abbreviation.trim())
      errs.abbreviation = "Abbreviation is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (unit) await updateUnit(unit.id, form);
      else await createUnit(form);
      onSuccess();
    } catch {}
  };

  const quickFill = (u: { name: string; abbreviation: string }) => {
    setForm(u);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!unit && (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
            Quick Select
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_UNITS.map((u) => (
              <button
                key={u.abbreviation}
                type="button"
                onClick={() => quickFill(u)}
                className="rounded-lg border border-white/8 bg-white/3 px-2.5 py-1 text-[11px] text-slate-500 transition-colors hover:border-amber-400/30 hover:bg-amber-400/8 hover:text-amber-400"
              >
                {u.name} ({u.abbreviation})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Unit Name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Kilogram"
          error={errors.name}
        />
        <Input
          label="Abbreviation"
          required
          value={form.abbreviation}
          onChange={(e) =>
            setForm((f) => ({ ...f, abbreviation: e.target.value }))
          }
          placeholder="e.g. kg"
          error={errors.abbreviation}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {unit ? "Update Unit" : "Create Unit"}
        </Button>
      </div>
    </form>
  );
}
