"use client";

import { useCallback, useEffect, useState } from "react";
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
import { toast } from "react-toastify";
import GlobalFeeButton from "@/components/modal/GlobalFeeForm";

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
  const [otherFees, setOtherFees] = useState([]);

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
      const res = await fetch(`/api/admin/state/${selectedState}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ types: data }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast("Rates updated successfully");
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Error while saving");
    } finally {
      setSaving(false);
    }
  };

  const saveGlobalFees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/others_fee", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otherFees),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save global fees");
      toast(json.message || "Global fees saved successfully");
    } catch (error) {
      toast.error(error.message || "Error saving global fees");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGlobalFee = async (id) => {
    try {
      const res = await fetch(`/api/admin/others_fee`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete fee");
      toast.success("Fee deleted successfully");
      fetchStates();
    } catch (error) {
      toast.error("Error deleting global fee");
    }
  };

  const fetchStates = useCallback(async () => {
    try {
      const res = await fetch("/api/");
      if (!res.ok) throw new Error("Failed to fetch state list");
      const json = await res.json();
      setStateList(json.stampDutyRate.map((s) => s.state));
      setOtherFees(json.otherFee || []);
    } catch (e) {
      console.error("Error fetching state list:", e);
      toast.error("Failed to load states");
    }
  }, []);

  useEffect(() => {
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
      <div className="space-y-3">
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
          <Input
            type="number"
            value={typeof value === "number" ? value : 0}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        )}

        {currentType !== "number" && (
          <div className="grid grid-cols-1 gap-2">
            {currentType === "percentage" && (
              <>
                <Input
                  placeholder="Rate (%)"
                  type="number"
                  value={value.rate ?? ""}
                  onChange={(e) =>
                    onChange({ ...value, rate: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Min"
                  type="number"
                  value={value.min ?? ""}
                  onChange={(e) =>
                    onChange({ ...value, min: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Max"
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
                <Input
                  placeholder="Per"
                  type="number"
                  value={value.per ?? ""}
                  onChange={(e) =>
                    onChange({ ...value, per: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Rate"
                  type="number"
                  value={value.rate ?? ""}
                  onChange={(e) =>
                    onChange({ ...value, rate: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Max"
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
                <Input
                  placeholder="Condition"
                  type="number"
                  value={value.condition ?? ""}
                  onChange={(e) =>
                    onChange({ ...value, condition: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Below"
                  type="number"
                  value={value.below ?? ""}
                  onChange={(e) =>
                    onChange({ ...value, below: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Above"
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
                {(value.tiers || []).map((tier, idx) => (
                  <div key={idx} className="grid gap-2 border p-2 rounded">
                    <Input
                      placeholder="Above"
                      type="number"
                      value={tier.above ?? 0}
                      onChange={(e) =>
                        handleTierChange(idx, "above", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={tier.max ?? 0}
                      onChange={(e) =>
                        handleTierChange(idx, "max", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Rate"
                      type="number"
                      value={tier.rate ?? 0}
                      onChange={(e) =>
                        handleTierChange(idx, "rate", e.target.value)
                      }
                    />
                    <Button
                      variant="destructive"
                      onClick={() => removeTier(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTier}>
                  + Add Tier
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center">MCA Fee Management</h1>

      <div className="flex flex-wrap justify-center gap-4">
        <Select
          value={selectedState}
          onValueChange={(v) => {
            setSelectedState(v);
            fetchState(v);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select State" />
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
          {saving ? "Saving..." : "Save State Fees"}
        </Button>
      </div>

      {selectedState && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entityTypes.map((type) => (
            <Card key={type} className="p-5">
              <CardContent className="space-y-4">
                <h3 className="text-xl font-semibold text-center capitalize">
                  {type.replace("-", " ")}
                </h3>

                <Input
                  placeholder="SPICe Fee"
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

                <Input
                  placeholder="MOA Fee"
                  type="number"
                  value={data[type]?.moa ?? 0}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Global Fees</h2>
          <div className="flex gap-4">
            <GlobalFeeButton refetch={fetchStates} />
            <Button onClick={saveGlobalFees}>Save Global Fees</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherFees.map((fee) => (
            <Card key={fee._id || fee.name} className="p-4">
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">
                    {fee.name.toUpperCase()}
                  </h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteGlobalFee(fee._id)}
                  >
                    Delete
                  </Button>
                </div>
                <Input
                  type="number"
                  value={fee.fee ?? 0}
                  onChange={(e) =>
                    setOtherFees((prev) =>
                      prev.map((f) =>
                        f.name === fee.name
                          ? { ...f, fee: Number(e.target.value) }
                          : f
                      )
                    )
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading state data...</p>
      )}
    </div>
  );
}
