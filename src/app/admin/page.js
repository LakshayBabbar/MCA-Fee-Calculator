"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

const entityTypes = ["share-capital", "no-share-capital", "section-8"];
const logicTypes = ["number", "percentage", "slab", "conditional", "tiered"];

const emptyEntity = {
  spice: 0,
  moa: 0,
  aoa: 0,
};

export default function AdminPage() {
  const [stateList, setStateList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [data, setData] = useState({
    "share-capital": { ...emptyEntity },
    "no-share-capital": { ...emptyEntity },
    "section-8": { ...emptyEntity },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchState = async (state) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/state/${state}`);
      if (!res.ok) throw new Error("Failed to fetch state data");
      const json = await res.json();
      setData(json.types);
    } catch (e) {
      console.error("Error fetching state:", e);
      toast.error("Failed to load state data.");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!selectedState) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/state/${selectedState}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ types: data }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Rates updated successfully");
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Error while saving");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch("/api/state");
        if (!res.ok) throw new Error("Failed to fetch state list");
        const json = await res.json();
        setStateList(json.map((s) => s.state));
      } catch (e) {
        console.error("Error fetching state list:", e);
        toast.error("Failed to load states");
      }
    };
    fetchStates();
  }, []);

  const renderLogicField = (label, value, onChange) => {
    const currentType = typeof value === "number" ? "number" : value?.type;

    const handleTierChange = (index, key, val) => {
      const updatedTiers = [...(value.tiers || [])];
      updatedTiers[index][key] = Number(val);
      onChange({ ...value, tiers: updatedTiers });
    };

    const addTier = () => {
      const newTier = { max: 0, rate: 0, above: 0 };
      onChange({ ...value, tiers: [...(value.tiers || []), newTier] });
    };

    const removeTier = (index) => {
      const updatedTiers = [...(value.tiers || [])];
      updatedTiers.splice(index, 1);
      onChange({ ...value, tiers: updatedTiers });
    };

    return (
      <div className="space-y-2">
        <Label>{label} Type</Label>
        <Select
          value={currentType}
          onValueChange={(val) => {
            if (val === "number") return onChange(0);
            onChange({ type: val });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label} type`} />
          </SelectTrigger>
          <SelectContent>
            {logicTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentType === "number" && (
          <>
            <Label>{label} Value</Label>
            <Input
              type="number"
              value={typeof value === "number" ? value : 0}
              onChange={(e) => onChange(Number(e.target.value))}
            />
          </>
        )}

        {currentType === "percentage" && (
          <>
            <Label>Rate</Label>
            <Input
              type="number"
              value={value.rate ?? ""}
              onChange={(e) =>
                onChange({ ...value, rate: Number(e.target.value) })
              }
            />
            <Label>Min</Label>
            <Input
              type="number"
              value={value.min ?? ""}
              onChange={(e) =>
                onChange({ ...value, min: Number(e.target.value) })
              }
            />
            <Label>Max</Label>
            <Input
              type="number"
              value={value.max ?? ""}
              onChange={(e) =>
                onChange({ ...value, max: Number(e.target.value) })
              }
            />
          </>
        )}

        {currentType === "slab" && (
          <>
            <Label>Per</Label>
            <Input
              type="number"
              value={value.per ?? ""}
              onChange={(e) =>
                onChange({ ...value, per: Number(e.target.value) })
              }
            />
            <Label>Rate</Label>
            <Input
              type="number"
              value={value.rate ?? ""}
              onChange={(e) =>
                onChange({ ...value, rate: Number(e.target.value) })
              }
            />
            <Label>Max</Label>
            <Input
              type="number"
              value={value.max ?? ""}
              onChange={(e) =>
                onChange({ ...value, max: Number(e.target.value) })
              }
            />
          </>
        )}

        {currentType === "conditional" && (
          <>
            <Label>Condition</Label>
            <Input
              type="number"
              value={value.condition ?? ""}
              onChange={(e) =>
                onChange({ ...value, condition: Number(e.target.value) })
              }
            />
            <Label>Below</Label>
            <Input
              type="number"
              value={value.below ?? ""}
              onChange={(e) =>
                onChange({ ...value, below: Number(e.target.value) })
              }
            />
            <Label>Above</Label>
            <Input
              type="number"
              value={value.above ?? ""}
              onChange={(e) =>
                onChange({ ...value, above: Number(e.target.value) })
              }
            />
          </>
        )}

        {currentType === "tiered" && (
          <div className="space-y-2">
            <Button type="button" variant="outline" onClick={addTier}>
              + Add Tier
            </Button>
            {(value.tiers || []).map((tier, idx) => (
              <div key={idx} className="border p-2 rounded space-y-2">
                <Label>Above</Label>
                <Input
                  type="number"
                  value={tier.above ?? 0}
                  onChange={(e) =>
                    handleTierChange(idx, "above", e.target.value)
                  }
                />
                <Label>Max</Label>
                <Input
                  type="number"
                  value={tier.max ?? 0}
                  onChange={(e) => handleTierChange(idx, "max", e.target.value)}
                />
                <Label>Rate</Label>
                <Input
                  type="number"
                  value={tier.rate ?? 0}
                  onChange={(e) =>
                    handleTierChange(idx, "rate", e.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeTier(idx)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel - MCA Fee Manager</h1>

      <div className="flex gap-4">
        <Select
          value={selectedState}
          onValueChange={(v) => {
            setSelectedState(v);
            fetchState(v);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a state" />
          </SelectTrigger>
          <SelectContent>
            {stateList.map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={save} disabled={!selectedState || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {selectedState && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entityTypes.map((type) => (
            <Card key={type} className="p-2">
              <CardContent className="space-y-2">
                <h3 className="text-lg font-semibold capitalize">
                  {type.replace("-", " ")}
                </h3>
                <div className="space-y-2">
                  <Label>SPICe</Label>
                  <Input
                    type="number"
                    value={data[type]?.spice ?? 0}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        [type]: {
                          ...prev[type],
                          spice: Number(e.target.value),
                        },
                      }))
                    }
                  />

                  <Label>MOA</Label>
                  <Input
                    type="number"
                    value={
                      typeof data[type]?.moa === "number" ? data[type]?.moa : 0
                    }
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        [type]: {
                          ...prev[type],
                          moa: Number(e.target.value),
                        },
                      }))
                    }
                  />

                  {renderLogicField("AOA", data[type]?.aoa, (updatedAoa) =>
                    setData((prev) => ({
                      ...prev,
                      [type]: {
                        ...prev[type],
                        aoa: updatedAoa,
                      },
                    }))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <p className="text-muted-foreground">Loading state data...</p>
      )}
    </div>
  );
}
