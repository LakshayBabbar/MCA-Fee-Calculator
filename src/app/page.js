"use client";

import { useState, useEffect, useMemo } from "react";
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
import { toast } from "sonner";

import { calculateAOAFee } from "@/lib/calculateFees";
import { entityOptions, entityTypeMap } from "@/lib/entityTypeMap";

const PAN_FEE = 66;
const TAN_FEE = 65;
const DIN_FEE_PER_DIRECTOR = 500;
const GST_RATE = 0.18;

export default function FeeCalculator() {
  const [mcaData, setMcaData] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("Delhi");
  const [selectedEntity, setSelectedEntity] = useState(
    "Private Limited Company"
  );
  const [authorizedCapital, setAuthorizedCapital] = useState(100000);
  const [includePAN, setIncludePAN] = useState(true);
  const [includeTAN, setIncludeTAN] = useState(true);
  const [includeDIN, setIncludeDIN] = useState(false);
  const [numDirectors, setNumDirectors] = useState(2);
  const [professionalFee, setProfessionalFee] = useState(5000);

  const fetchStates = async () => {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Failed to fetch state list");
      const json = await res.json();
      setMcaData(json);
      setStates(json.map((s) => s.state));
    } catch (error) {
      console.error("State Fetch Error:", error);
      toast.error("Unable to load states. Please try again.");
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const selectedData = useMemo(() => {
    const mappedType = entityTypeMap[selectedEntity];
    const stateData = mcaData.find((s) => s.state === selectedState);
    return stateData?.types?.[mappedType] ?? null;
  }, [mcaData, selectedState, selectedEntity]);

  const feeBreakdown = useMemo(() => {
    if (!selectedData) return null;

    const aoaFee = calculateAOAFee(selectedData.aoa, authorizedCapital);
    const dinFee = includeDIN ? numDirectors * DIN_FEE_PER_DIRECTOR : 0;
    const panFee = includePAN ? PAN_FEE : 0;
    const tanFee = includeTAN ? TAN_FEE : 0;
    const gst = GST_RATE * (professionalFee + dinFee + panFee + tanFee);
    const total =
      selectedData.spice +
      selectedData.moa +
      aoaFee +
      dinFee +
      panFee +
      tanFee +
      professionalFee +
      gst;

    return {
      spice: selectedData.spice,
      moa: selectedData.moa,
      aoa: aoaFee,
      din: dinFee,
      pan: panFee,
      tan: tanFee,
      professional: professionalFee,
      gst,
      total,
    };
  }, [
    selectedData,
    authorizedCapital,
    includeDIN,
    numDirectors,
    includePAN,
    includeTAN,
    professionalFee,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md space-y-6">
        <h2 className="text-3xl text-center font-serif font-light">
          MCA Incorporation Fee Calculator
        </h2>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>State</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {entityOptions.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEntity !== "Section 8 Company" && (
            <div className="space-y-2">
              <Label>Authorized Capital (₹)</Label>
              <Input
                type="number"
                value={authorizedCapital}
                onChange={(e) => setAuthorizedCapital(Number(e.target.value))}
                min={1000}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Professional Fee (₹)</Label>
            <Input
              type="number"
              value={professionalFee}
              onChange={(e) => setProfessionalFee(Number(e.target.value))}
              min={0}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={includePAN}
                onCheckedChange={(val) => setIncludePAN(Boolean(val))}
              />
              <Label>Include PAN (₹{PAN_FEE})</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={includeTAN}
                onCheckedChange={(val) => setIncludeTAN(Boolean(val))}
              />
              <Label>Include TAN (₹{TAN_FEE})</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={includeDIN}
                onCheckedChange={(val) => setIncludeDIN(Boolean(val))}
              />
              <Label>DIN (₹{DIN_FEE_PER_DIRECTOR}/director)</Label>
            </div>

            {includeDIN && (
              <div className="space-y-2 col-span-full">
                <Label>Number of Directors</Label>
                <Input
                  type="number"
                  value={numDirectors}
                  onChange={(e) => setNumDirectors(Number(e.target.value))}
                  min={1}
                />
              </div>
            )}
          </div>

          {feeBreakdown && (
            <div className="mt-6 space-y-1 border-t pt-4 text-sm text-gray-700 dark:text-gray-200">
              <p>SPICe: ₹{feeBreakdown.spice}</p>
              <p>MOA: ₹{feeBreakdown.moa}</p>
              <p>AOA: ₹{feeBreakdown.aoa.toFixed(2)}</p>
              {includePAN && <p>PAN: ₹{feeBreakdown.pan}</p>}
              {includeTAN && <p>TAN: ₹{feeBreakdown.tan}</p>}
              {includeDIN && <p>DIN: ₹{feeBreakdown.din}</p>}
              <p>Professional Fee: ₹{feeBreakdown.professional}</p>
              <p>GST (18%): ₹{feeBreakdown.gst.toFixed(2)}</p>
              <p className="font-bold text-lg mt-2">
                Total Estimated Fee: ₹{feeBreakdown.total.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
