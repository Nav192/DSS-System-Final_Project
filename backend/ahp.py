import numpy as np
from typing import List, Dict


def calculate_ahp_weights(matrix: List[List[float]]) -> Dict:
    """
    Calculates AHP weights (principal eigenvector) and Consistency Ratio (CR)
    from a pairwise comparison matrix.
    """
    matrix_np = np.array(matrix)
    n = len(matrix_np)

    if n == 0:
        return {"weights": [], "cr": 0.0, "is_consistent": True, "message": "Matrix is empty."}

    # Check for square matrix
    if matrix_np.shape[0] != matrix_np.shape[1]:
        raise ValueError("Matrix must be square.")

    # Check for reciprocity
    for i in range(n):
        for j in range(n):
            if i == j and matrix_np[i, j] != 1:
                raise ValueError(f"Diagonal element at ({i},{j}) must be 1.")
            if i != j and matrix_np[i, j] != 1 / matrix_np[j, i]:
                raise ValueError(f"Matrix is not reciprocal at ({i},{j}).")

    # Calculate eigenvalues and eigenvectors
    eigenvalues, eigenvectors = np.linalg.eig(matrix_np)

    # Find the maximum eigenvalue (lambda_max)
    lambda_max = np.max(np.real(eigenvalues))

    # Find the eigenvector corresponding to lambda_max
    principal_eigenvector = np.real(eigenvectors[:, np.argmax(np.real(eigenvalues))])

    # Normalize the principal eigenvector to get weights
    weights = principal_eigenvector / np.sum(principal_eigenvector)

    # Calculate Consistency Index (CI)
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0

    # Random Index (RI) values for n=1 to n=10
    # Source: Saaty, T. L. (1980). The Analytic Hierarchy Process. McGraw-Hill.
    ri_values = {
        1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
        6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
    }

    ri = ri_values.get(n, 1.50) # Use 1.50 for n > 10 or if n not in table

    # Calculate Consistency Ratio (CR)
    cr = ci / ri if ri > 0 else 0.0

    is_consistent = cr < 0.10 # CR < 0.10 is generally considered consistent

    return {
        "weights": weights.tolist(),
        "cr": cr,
        "is_consistent": is_consistent,
        "message": "Matrix is consistent." if is_consistent else "Matrix is inconsistent. Please revise your comparisons."
    }
