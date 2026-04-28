import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

def calculate_moora_ranking(
    restaurants_data: List[Dict[str, Any]],
    ahp_weights: List[float],
    criterion_types: Dict[str, str] = None,
    criteria_order: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Calculates MOORA ranking for restaurants based on AHP weights.
    criterion_types: dict with key as criterion name and value as 'benefit' or 'cost'
    criteria_order: list of criterion names in order (to match ahp_weights order)
    """

    default_criteria_info = {
        "harga": "cost",
        "rasa": "benefit",
        "kebersihan": "benefit",
        "kenyamanan": "benefit",
        "pelayanan": "benefit",
        "fasilitas": "benefit",
        "popularitas": "benefit",
    }

    if criterion_types:
        criteria_info = criterion_types
    else:
        criteria_info = default_criteria_info

    if criteria_order:
        criteria_names = [c.lower() for c in criteria_order]
    else:
        criteria_names = list(criteria_info.keys())

    criteria_type_list = []
    for crit in criteria_names:
        crit_type = criteria_info.get(crit, criteria_info.get(crit.capitalize(), "benefit"))
        criteria_type_list.append(crit_type)

    if not restaurants_data:
        return []

    matrix_data = []
    restaurant_names = []
    restaurant_ids = []

    for restaurant in restaurants_data:
        row = []
        for crit in criteria_names:
            val = restaurant.get(crit, 0)
            row.append(val)
        matrix_data.append(row)
        restaurant_names.append(restaurant["name"])
        restaurant_ids.append(restaurant["id"])

    decision_matrix = np.array(matrix_data, dtype=float)

    if decision_matrix.shape[0] == 0:
        return []

    normalized_matrix = np.zeros_like(decision_matrix)
    for j in range(decision_matrix.shape[1]):
        col_squared_sum = np.sum(decision_matrix[:, j] ** 2)
        if col_squared_sum > 0:
            sqrt_val = np.sqrt(col_squared_sum)
            normalized_matrix[:, j] = decision_matrix[:, j] / sqrt_val
        else:
            normalized_matrix[:, j] = 0

    weighted_normalized_matrix = normalized_matrix * np.array(ahp_weights)

    y_values = []
    for i in range(weighted_normalized_matrix.shape[0]):
        total_sum = 0
        for j in range(len(criteria_names)):
            crit_type = criteria_type_list[j]
            if crit_type == "cost":
                total_sum -= weighted_normalized_matrix[i, j]
            else:
                total_sum += weighted_normalized_matrix[i, j]
        y_values.append(total_sum)

    ranked_restaurants = []
    for i, y_value in enumerate(y_values):
        ranked_restaurants.append({
            "id": restaurant_ids[i],
            "name": restaurant_names[i],
            "score": y_value,
            **restaurants_data[i]
        })

    ranked_restaurants.sort(key=lambda x: (round(x["score"], 10), x["name"]), reverse=True)

    for i, restaurant in enumerate(ranked_restaurants):
        restaurant["rank"] = i + 1

    return ranked_restaurants
