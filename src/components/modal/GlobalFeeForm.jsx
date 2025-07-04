import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const GlobalFeeForm = ({ toggleModal, refetch }) => {
  const [formData, setFormData] = useState({
    name: "",
    fee: "",
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const req = await fetch("/api/admin/others_fee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const res = await req.json();
      if (res.error) {
        throw new Error(res.error || "Failed to add global fee");
      }
      setFormData({ name: "", fee: "" });
      toggleModal();
      refetch();
    } catch (error) {
      toast(error.message || "Failed to add global fee");
    }
  };

  return (
    <div className="fixed left-0 top-0 w-full h-screen bg-black/[0.5] backdrop-blur-2xl flex items-center justify-center">
      <form
        onSubmit={submitHandler}
        className="relative rounded-xl p-5 bg-white w-96 flex flex-col gap-4"
      >
        <X className="absolute top-4 right-4" onClick={toggleModal} />
        <h1 className="text-lg font-bold">Add New</h1>
        <Input
          type="text"
          value={formData.name}
          placeholder="Enter Fee Name"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
        <Input
          placeholder="Enter Fee Amount"
          type="text"
          value={formData.fee}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fee: e.target.value }))
          }
          required
        />
        <Button type="submit">Add</Button>
      </form>
    </div>
  );
};

export default function GlobalFeeButton({ refetch }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button onClick={toggleModal}>Add Global Fee</Button>
      {isOpen && <GlobalFeeForm toggleModal={toggleModal} refetch={refetch} />}
    </>
  );
}
