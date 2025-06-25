"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateAOAFee } from "@/lib/calculateFees";
import { getStampDuty } from "@/lib/loadStampDutyRates";
import { entityOptions, entityTypeMap } from "@/lib/entityTypeMap";

const states = Object.keys(require("@/data/stampDutyRates.json"));
const PAN_FEE = 66;
const TAN_FEE = 77;

export default function FeeCalculator() {
  const [state, setState] = useState("Delhi");
  const [entity, setEntity] = useState("Private Limited Company");
  const [capital, setCapital] = useState(100000);
  const [includePAN, setIncludePAN] = useState(true);
  const [includeTAN, setIncludeTAN] = useState(true);
  const [includeDIN, setIncludeDIN] = useState(false);
  const [numDirectors, setNumDirectors] = useState(2);

  const [fees, setFees] = useState({
    spice: 0,
    moa: 0,
    aoa: 0,
    pan: 0,
    tan: 0,
    din: 0,
    professional: 5000,
    gst: 0,
    total: 0,
  });

  useEffect(() => {
    const mappedType = entityTypeMap[entity];
    const data = getStampDuty(state, mappedType);
    if (!data) return;

    const fallbackType =
      mappedType === "section-8"
        ? capital > 0
          ? "share-capital"
          : "no-share-capital"
        : mappedType;

    const fallbackData = getStampDuty(state, fallbackType);

    const aoaFee = calculateAOAFee(
      data.aoa,
      capital,
      data.spice,
      fallbackData?.aoa
    );
    const dinFee = includeDIN ? numDirectors * 500 : 0;
    const panFee = includePAN ? PAN_FEE : 0;
    const tanFee = includeTAN ? TAN_FEE : 0;
    const prof = 5000;
    const gst = 0.18 * (prof + dinFee + panFee + tanFee);
    const total =
      data.spice +
      data.moa +
      aoaFee +
      prof +
      panFee +
      tanFee +
      dinFee +
      gst;

    setFees({
      spice: data.spice,
      moa: data.moa,
      aoa: aoaFee,
      din: dinFee,
      pan: panFee,
      tan: tanFee,
      professional: prof,
      gst,
      total,
    });
  }, [
    state,
    entity,
    capital,
    includeDIN,
    numDirectors,
    includePAN,
    includeTAN,
  ]);

  return (
    <div className="max-w-xl mx-auto space-y-4 p-4">
      <h2 className="text-2xl font-semibold">
        MCA Incorporation Fee Calculator
      </h2>

      <div className="space-y-2">
        <Label>State</Label>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Entity Type</Label>
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {entityOptions.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {entity !== "Section 8 Company" && (
        <div className="space-y-2">
          <Label>Authorized Capital (₹)</Label>
          <Input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          checked={includePAN}
          onCheckedChange={(checked) => setIncludePAN(Boolean(checked))}
        />{" "}
        <Label>Include PAN (₹{PAN_FEE})</Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={includeTAN}
          onCheckedChange={(checked) => setIncludeTAN(Boolean(checked))}
        />{" "}
        <Label>Include TAN (₹{TAN_FEE})</Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={includeDIN}
          onCheckedChange={(checked) => setIncludeDIN(Boolean(checked))}
        />{" "}
        <Label>DIN (₹500 per director)</Label>
      </div>

      {includeDIN && (
        <div className="space-y-2">
          <Label>Number of Directors</Label>
          <Input
            type="number"
            value={numDirectors}
            onChange={(e) => setNumDirectors(Number(e.target.value))}
          />
        </div>
      )}

      <div className="mt-6 space-y-1 border-t pt-4">
        <p>SPICe: ₹{fees.spice}</p>
        <p>MOA: ₹{fees.moa}</p>
        <p>AOA: ₹{fees.aoa.toFixed(2)}</p>
        {includePAN && <p>PAN: ₹{fees.pan}</p>}
        {includeTAN && <p>TAN: ₹{fees.tan}</p>}
        {includeDIN && <p>DIN: ₹{fees.din}</p>}
        <p>Professional Fee: ₹{fees.professional}</p>
        <p>GST (18%): ₹{fees.gst.toFixed(2)}</p>
        <p className="font-bold text-lg">
          Total Estimated Fee: ₹{fees.total.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
