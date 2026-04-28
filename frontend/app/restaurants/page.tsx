"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { Restaurant, RestaurantCreate } from "@/types/restaurant";

const RESTAURANT_STORAGE_KEY = "dss_restaurants_data";
const CRITERION_TYPE_STORAGE_KEY = "dss_criterion_types";

type CriterionType = "benefit" | "cost";

interface CriterionTypeData {
  key: string;
  label: string;
  type: CriterionType;
}

const INITIAL_CRITERIA_FIELDS: CriterionTypeData[] = [
  { key: "harga", label: "Harga", type: "cost" },
  { key: "rasa", label: "Rasa", type: "benefit" },
  { key: "kebersihan", label: "Kebersihan", type: "benefit" },
  { key: "kenyamanan", label: "Kenyamanan", type: "benefit" },
  { key: "pelayanan", label: "Pelayanan", type: "benefit" },
  { key: "fasilitas", label: "Fasilitas", type: "benefit" },
  { key: "popularitas", label: "Popularitas", type: "benefit" },
];

export default function RestaurantsPage() {
  const { restaurants, setRestaurants, setCurrentStep } = useAppContext();
  const [newRestaurant, setNewRestaurant] = useState<RestaurantCreate>({
    name: "",
    harga: 0,
    rasa: 0,
    kebersihan: 0,
    kenyamanan: 0,
    pelayanan: 0,
    fasilitas: 0,
    popularitas: 0,
  });
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriaFields, setCriteriaFields] = useState<CriterionTypeData[]>(
    INITIAL_CRITERIA_FIELDS,
  );

  useEffect(() => {
    setCurrentStep(2);
    const savedRestaurants = localStorage.getItem(RESTAURANT_STORAGE_KEY);
    if (savedRestaurants) {
      try {
        const parsed = JSON.parse(savedRestaurants);
        setRestaurants(parsed);
      } catch {
        setRestaurants([]);
      }
    }

    const savedTypes = localStorage.getItem(CRITERION_TYPE_STORAGE_KEY);
    if (savedTypes) {
      try {
        const parsedTypes = JSON.parse(savedTypes);
        setCriteriaFields(parsedTypes);
      } catch {
        setCriteriaFields(INITIAL_CRITERIA_FIELDS);
      }
    }
  }, [setCurrentStep]);

  const saveRestaurants = () => {
    localStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(restaurants));
    localStorage.setItem(
      CRITERION_TYPE_STORAGE_KEY,
      JSON.stringify(criteriaFields),
    );
    alert("Data restoran dan tipe kriteria berhasil disimpan!");
  };

  const resetRestaurants = () => {
    if (confirm("Apakah Anda yakin ingin reset semua data restoran?")) {
      localStorage.removeItem(RESTAURANT_STORAGE_KEY);
      setRestaurants([]);
      alert("Data restoran berhasil direset!");
    }
  };

  const toggleCriterionType = (key: string) => {
    const updated = criteriaFields.map((c) =>
      c.key === key
        ? { ...c, type: c.type === "benefit" ? "cost" : "benefit" }
        : c,
    );
    setCriteriaFields(updated);
    localStorage.setItem(CRITERION_TYPE_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewRestaurant((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRestaurantId) {
      const updatedRestaurants = restaurants.map((r) =>
        r.id === editingRestaurantId
          ? { ...newRestaurant, id: editingRestaurantId }
          : r,
      );
      setRestaurants(updatedRestaurants);
      localStorage.setItem(
        RESTAURANT_STORAGE_KEY,
        JSON.stringify(updatedRestaurants),
      );
    } else {
      const newId = String(Date.now());
      const newData = { ...newRestaurant, id: newId };
      const updatedRestaurants = [...restaurants, newData];
      setRestaurants(updatedRestaurants);
      localStorage.setItem(
        RESTAURANT_STORAGE_KEY,
        JSON.stringify(updatedRestaurants),
      );
    }
    setNewRestaurant({
      name: "",
      harga: 0,
      rasa: 0,
      kebersihan: 0,
      kenyamanan: 0,
      pelayanan: 0,
      fasilitas: 0,
      popularitas: 0,
    });
    setEditingRestaurantId(null);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setNewRestaurant(restaurant);
    setEditingRestaurantId(restaurant.id);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus restoran ini?")) return;
    const filteredRestaurants = restaurants.filter((r) => r.id !== id);
    setRestaurants(filteredRestaurants);
    localStorage.setItem(
      RESTAURANT_STORAGE_KEY,
      JSON.stringify(filteredRestaurants),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Step 2: Input Data Alternatif (Rumah Makan)
        </h2>

        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            {editingRestaurantId
              ? "Edit Detail Rumah Makan"
              : "Tambah Rumah Makan Baru"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Rumah Makan
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newRestaurant.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                placeholder="Contoh: Restoran Enak Jaya"
              />
            </div>
            {criteriaFields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className={`block text-sm font-medium mb-1 ${
                    field.type === "benefit" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {field.label} ({field.type === "benefit" ? "Benefit" : "Cost"}
                  )
                </label>
                <input
                  type="text"
                  id={field.key}
                  name={field.key}
                  value={String(
                    newRestaurant[field.key as keyof RestaurantCreate] ?? 0,
                  )}
                  onChange={(e) => {
                    const val = e.target.value.replace(",", ".");
                    setNewRestaurant((prev) => ({
                      ...prev,
                      [field.key]: parseFloat(val) || 0,
                    }));
                  }}
                  required
                  min="0"
                  step="0.1"
                  className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  placeholder="Nilai (0-100)"
                />
              </div>
            ))}
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading
                  ? "Menyimpan..."
                  : editingRestaurantId
                    ? "Update Rumah Makan"
                    : "Tambah Rumah Makan"}
              </button>
              {editingRestaurantId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRestaurantId(null);
                    setNewRestaurant({
                      name: "",
                      harga: 0,
                      rasa: 0,
                      kebersihan: 0,
                      kenyamanan: 0,
                      pelayanan: 0,
                      fasilitas: 0,
                      popularitas: 0,
                    });
                  }}
                  className="px-6 py-2.5 bg-gray-400 text-white font-bold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-offset-2 transition duration-200 ease-in-out"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">
              Tipe Kriteria (Cost/Benefit)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={saveRestaurants}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-200 ease-in-out"
              >
                Simpan Data
              </button>
              <button
                onClick={resetRestaurants}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out"
              >
                Reset Data
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold text-green-600">Benefit</span>:
            Semakin besar semakin baik (dinormalisasi dengan max).{" "}
            <span className="font-semibold text-red-600">Cost</span>: Semakin
            kecil semakin baik (dinormalisasi dengan min).
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {criteriaFields.map((field) => (
              <button
                key={field.key}
                onClick={() => toggleCriterionType(field.key)}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  field.type === "benefit"
                    ? "bg-green-100 text-green-700 border-2 border-green-500 hover:bg-green-200"
                    : "bg-red-100 text-red-700 border-2 border-red-500 hover:bg-red-200"
                }`}
              >
                {field.label}: {field.type === "benefit" ? "Benefit" : "Cost"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">
              Daftar Rumah Makan ({restaurants.length})
            </h3>
          </div>
          {loading && <p className="text-gray-600">Memuat data restoran...</p>}
          {!loading && restaurants.length === 0 && (
            <p className="text-gray-600">
              Belum ada rumah makan yang ditambahkan.
            </p>
          )}
          {!loading && restaurants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Nama
                    </th>
                    {criteriaFields.map((field) => (
                      <th
                        key={field.key}
                        className={`py-3 px-4 border-b border-gray-200 text-center text-sm font-medium uppercase tracking-wider ${
                          field.type === "benefit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {field.label} ({field.type === "benefit" ? "B" : "C"})
                      </th>
                    ))}
                    <th className="py-3 px-4 border-b border-gray-200 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant, index) => (
                    <tr
                      key={restaurant.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 font-medium">
                        {restaurant.name}
                      </td>
                      {criteriaFields.map((field) => (
                        <td
                          key={field.key}
                          className="py-3 px-4 border-b border-gray-200 text-center text-gray-700"
                        >
                          {restaurant[field.key as keyof Restaurant]}
                        </td>
                      ))}
                      <td className="py-3 px-4 border-b border-gray-200 flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(restaurant)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-150 ease-in-out text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(restaurant.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-150 ease-in-out text-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
