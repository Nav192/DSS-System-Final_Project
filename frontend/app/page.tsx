"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { AHPCalculateResponse } from "@/types/ahp";

const INITIAL_CRITERIA = [
  "Harga",
  "Rasa",
  "Kebersihan",
  "Kenyamanan",
  "Pelayanan",
  "Fasilitas",
  "Popularitas",
];

const STORAGE_KEY = "dss_criteria_data";

export default function Home() {
  const { ahpResult, setAhpResult, setCurrentStep } = useAppContext();
  const [criteria, setCriteria] = useState<string[]>(INITIAL_CRITERIA);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newCriteriaInput, setNewCriteriaInput] = useState<string>("");
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [tempInput, setTempInput] = useState<{ [key: string]: string }>({});
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    setCurrentStep(1);
  }, [setCurrentStep]);

  useEffect(() => {
    if (isDataLoaded) return;
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.criteria && parsed.matrix) {
          setCriteria(parsed.criteria);
          setMatrix(parsed.matrix);
          if (parsed.ahpResult) {
            setAhpResult(parsed.ahpResult);
          }
          setIsDataLoaded(true);
        }
      } catch {
        setCriteria(INITIAL_CRITERIA);
        setMatrix(createEmptyMatrix(INITIAL_CRITERIA.length));
        setIsDataLoaded(true);
      }
    } else {
      setMatrix(createEmptyMatrix(INITIAL_CRITERIA.length));
      setIsDataLoaded(true);
    }
  }, [isDataLoaded, setAhpResult]);

  const createEmptyMatrix = (length: number) => {
    return Array(length)
      .fill(0)
      .map((_, i) =>
        Array(length)
          .fill(0)
          .map((_, j) => (i === j ? 1 : 1)),
      );
  };

  const expandMatrix = (
    oldMatrix: number[][],
    oldLength: number,
    newLength: number,
  ) => {
    const newMatrix = Array(newLength)
      .fill(0)
      .map((_, i) =>
        Array(newLength)
          .fill(0)
          .map((_, j) => {
            if (i === j) return 1;
            if (i < oldLength && j < oldLength) return oldMatrix[i][j];
            return 1;
          }),
      );
    return newMatrix;
  };

  const getCritType = (critKey: string): string => {
    try {
      const savedTypes = localStorage.getItem("dss_criterion_types");
      if (savedTypes) {
        const types = JSON.parse(savedTypes);
        const found = types.find((t: any) => t.key === critKey);
        if (found) return found.type;
      }
    } catch {}
    return "benefit";
  };

  useEffect(() => {
    if (criteria.length > 0) {
      if (matrix.length === 0) {
        setMatrix(createEmptyMatrix(criteria.length));
      } else if (matrix.length < criteria.length) {
        setMatrix(expandMatrix(matrix, matrix.length, criteria.length));
      }
    }
  }, [criteria]);

  useEffect(() => {
    if (!isDataLoaded) return;
    if (matrix.length > 0) {
      autoSave();
    }
  }, [matrix, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    if (criteria.length > 0) {
      autoSave();
    }
  }, [criteria, isDataLoaded]);

  const addCriteria = () => {
    if (
      newCriteriaInput.trim() &&
      !criteria.includes(newCriteriaInput.trim())
    ) {
      const newCriteria = [...criteria, newCriteriaInput.trim()];
      setCriteria(newCriteria);
      setMatrix(expandMatrix(matrix, matrix.length, newCriteria.length));
      setNewCriteriaInput("");
    } else if (criteria.includes(newCriteriaInput.trim())) {
      alert("Kriteria sudah ada!");
    }
  };

  const deleteCriteria = (index: number) => {
    if (criteria.length <= 1) {
      alert("Minimal harus ada 1 kriteria!");
      return;
    }
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);

    const newMatrix = matrix
      .filter((_, i) => i !== index)
      .map((row) => row.filter((_, j) => j !== index));
    setMatrix(newMatrix);
  };

  const saveData = () => {
    const dataToSave = {
      criteria,
      matrix,
      ahpResult: ahpResult,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    alert("Data berhasil disimpan!");
  };

  const autoSave = () => {
    const dataToSave = {
      criteria,
      matrix,
      ahpResult: ahpResult,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  const resetData = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin reset semua data? Data yang tersimpan akan dihapus.",
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setCriteria(INITIAL_CRITERIA);
      setMatrix(createEmptyMatrix(INITIAL_CRITERIA.length));
      setAhpResult(null);
      alert("Data berhasil direset!");
    }
  };

  const handleMatrixChange = (row: number, col: number, value: number) => {
    if (isNaN(value) || value < 0) return;

    const newMatrix = matrix.map((r, i) =>
      r.map((c, j) => {
        if (i === row && j === col) {
          return value;
        }
        if (i === col && j === row) {
          return value !== 0 ? 1 / value : 0;
        }
        return c;
      }),
    );
    setMatrix(newMatrix);
  };

  const calculateAHP = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/ahp/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matrix, criteria }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to calculate AHP");
      }

      const result: AHPCalculateResponse = await response.json();
      setAhpResult(result);
      autoSave();
    } catch (err: any) {
      setError(err.message);
      setAhpResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Step 1: Hitung Bobot Kriteria (AHP)
        </h2>

        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Matriks Perbandingan Berpasangan
          </h3>

          <div className="mb-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={saveData}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200 ease-in-out"
              >
                Simpan Data
              </button>
              <button
                onClick={resetData}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-200 ease-in-out"
              >
                Reset Data
              </button>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Daftar Kriteria
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {criteria.map((crit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300"
                >
                  <span className="font-medium text-gray-700">{crit}</span>
                  <button
                    onClick={() => deleteCriteria(index)}
                    disabled={criteria.length <= 1}
                    className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Hapus kriteria"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Tambah Kriteria Baru
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={newCriteriaInput}
                onChange={(e) => setNewCriteriaInput(e.target.value)}
                placeholder="Nama kriteria baru"
                className="flex-grow p-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <button
                onClick={addCriteria}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newCriteriaInput.trim()}
              >
                Tambah Kriteria
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Kriteria
                  </th>
                  {criteria.map((crit, index) => {
                    const critKey = crit.toLowerCase();
                    const critType = getCritType(critKey);
                    return (
                      <th
                        key={index}
                        className={`py-3 px-4 border-b border-gray-200 text-center text-sm font-medium uppercase tracking-wider ${
                          critType === "benefit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {crit} ({critType === "benefit" ? "B" : "C"})
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {criteria.map((rowCrit, rowIndex) => {
                  const rowCritKey = rowCrit.toLowerCase();
                  const rowCritType = getCritType(rowCritKey);
                  return (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td
                        className={`py-3 px-4 border-b border-gray-200 font-medium ${
                          rowCritType === "benefit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {rowCrit} ({rowCritType === "benefit" ? "B" : "C"})
                      </td>
                      {criteria.map((colCrit, colIndex) => (
                        <td
                          key={colIndex}
                          className="py-3 px-4 border-b border-gray-200"
                        >
                          {rowIndex === colIndex ? (
                            <input
                              type="number"
                              value={1}
                              readOnly
                              className="w-full p-2 border border-gray-300 rounded-md text-center bg-gray-100 text-gray-700 cursor-not-allowed"
                            />
                          ) : rowIndex < colIndex ? (
                            <input
                              type="text"
                              value={
                                tempInput[`${rowIndex}-${colIndex}`] ??
                                String(
                                  matrix[rowIndex]?.[colIndex] ?? 1,
                                ).replace(".", ",")
                              }
                              onChange={(e) => {
                                setTempInput((prev) => ({
                                  ...prev,
                                  [`${rowIndex}-${colIndex}`]: e.target.value,
                                }));
                              }}
                              onBlur={(e) => {
                                const rawVal =
                                  tempInput[`${rowIndex}-${colIndex}`] ??
                                  e.target.value;
                                const normalizedVal = rawVal.replace(",", ".");
                                const num = parseFloat(normalizedVal);
                                if (!isNaN(num) && num >= 0) {
                                  handleMatrixChange(rowIndex, colIndex, num);
                                }
                                setTempInput((prev) => {
                                  const newObj = { ...prev };
                                  delete newObj[`${rowIndex}-${colIndex}`];
                                  return newObj;
                                });
                              }}
                              className="w-full p-2 border border-blue-300 rounded-md text-center bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <input
                              type="number"
                              value={(
                                1 / (matrix[colIndex]?.[rowIndex] || 1)
                              ).toFixed(3)}
                              readOnly
                              className="w-full p-2 border border-gray-300 rounded-md text-center bg-gray-100 text-gray-700 cursor-not-allowed"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={calculateAHP}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Menghitung..." : "Hitung Bobot AHP"}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {ahpResult && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                Hasil Perhitungan AHP
              </h3>
              <p
                className={`text-lg font-medium ${ahpResult.is_consistent ? "text-green-700" : "text-red-700"}`}
              >
                Konsistensi Ratio (CR):{" "}
                <span className="font-bold">{ahpResult.cr.toFixed(4)}</span> (
                {ahpResult.message})
              </p>
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Bobot Kriteria:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {ahpResult.weights.map((weight, index) => (
                    <li key={index} className="text-gray-600">
                      <span className="font-medium">
                        {criteria[index] || `Unknown Criteria ${index + 1}`}
                      </span>
                      : <span className="font-bold">{weight.toFixed(4)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
