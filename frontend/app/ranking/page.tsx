"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { RankedRestaurant } from "@/types/restaurant";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const RANKING_STORAGE_KEY = "dss_ranking_data";

export default function RankingPage() {
  const { ahpResult, restaurants, setCurrentStep } = useAppContext();
  const [rankedRestaurants, setRankedRestaurants] = useState<
    RankedRestaurant[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  useEffect(() => {
    const savedRanking = localStorage.getItem(RANKING_STORAGE_KEY);
    if (savedRanking) {
      try {
        const parsed = JSON.parse(savedRanking);
        setRankedRestaurants(parsed);
      } catch {
        setRankedRestaurants([]);
      }
    }
  }, []);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const savedCriterionTypes = localStorage.getItem("dss_criterion_types");
      let criterionTypes: Record<string, string> | null = null;

      if (savedCriterionTypes) {
        try {
          const parsed = JSON.parse(savedCriterionTypes);
          criterionTypes = {};
          // Create array first, then iterate to maintain order
          const criteriaArray: string[] = ahpResult?.criteria || [];
          for (const critName of criteriaArray) {
            const key = critName.toLowerCase();
            const found = parsed.find((item: any) => item.key === key);
            if (found) {
              criterionTypes[key] = found.type;
            }
          }
        } catch {}
      }

      const response = await fetch("http://localhost:8000/moora/rank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ahp_weights: ahpResult?.weights,
          criteria: ahpResult?.criteria,
          restaurants: restaurants,
          criterion_types: criterionTypes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch ranking");
      }

      const data: RankedRestaurant[] = await response.json();
      setRankedRestaurants(data);
    } catch (err: any) {
      const errorMessage = err?.message || err?.detail || String(err);
      setError(errorMessage);
      setRankedRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [ahpResult, restaurants]);

  useEffect(() => {
    if (ahpResult && ahpResult.is_consistent && restaurants.length > 0) {
      fetchRanking();
    } else if (!ahpResult || !ahpResult.is_consistent) {
      setError("Harap hitung bobot AHP dan pastikan konsisten di Langkah 1.");
    } else if (restaurants.length === 0) {
      setError("Harap tambahkan data restoran di Langkah 2.");
    }
  }, [ahpResult, restaurants, fetchRanking]);

  const saveRanking = () => {
    localStorage.setItem(
      RANKING_STORAGE_KEY,
      JSON.stringify(rankedRestaurants),
    );
    alert("Data ranking berhasil disimpan!");
  };

  const resetRanking = () => {
    if (confirm("Apakah Anda yakin ingin reset data ranking?")) {
      localStorage.removeItem(RANKING_STORAGE_KEY);
      setRankedRestaurants([]);
      alert("Data ranking berhasil direset!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Step 3: Hasil Ranking (MOORA)
        </h2>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {loading && <p>Menghitung ranking...</p>}

        {!loading && !error && rankedRestaurants.length > 0 && (
          <>
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Tabel Ranking
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={saveRanking}
                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-200 ease-in-out"
                  >
                    Simpan Ranking
                  </button>
                  <button
                    onClick={resetRanking}
                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out"
                  >
                    Reset Ranking
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Nama Rumah Makan
                      </th>
                      <th className="py-3 px-4 border-b border-gray-200 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Skor MOORA
                      </th>
                      {/* Add other criteria columns if desired */}
                    </tr>
                  </thead>
                  <tbody>
                    {rankedRestaurants.map((restaurant, index) => (
                      <tr
                        key={restaurant.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="py-3 px-4 border-b border-gray-200 text-gray-800 font-medium">
                          {restaurant.rank}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200 text-gray-800 font-medium">
                          {restaurant.name}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">
                          {restaurant.score.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Grafik Perbandingan Skor
              </h3>
              <div className="h-96">
                {" "}
                {/* Fixed height for ResponsiveContainer */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rankedRestaurants}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="name"
                      angle={-15}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      stroke="#555"
                    />
                    <YAxis stroke="#555" />
                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.1)" }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="score"
                      fill="#3b82f6"
                      name="Skor MOORA"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
