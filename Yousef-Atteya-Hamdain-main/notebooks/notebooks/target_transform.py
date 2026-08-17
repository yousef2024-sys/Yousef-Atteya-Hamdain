"""Shared target-transform functions used by TransformedTargetRegressor.

House prices are heavily right-skewed, so the model is trained on
log1p(price) and predictions are inverted with expm1. This module must be
importable under the same name both when the model is trained (notebooks/)
and when it is loaded by the backend (backend/), because joblib/pickle
stores the function's module path at save time.
"""
import numpy as np


def log1p_transform(y):
    return np.log1p(y)


def expm1_inverse_transform(y):
    # Clip before inverting: a linear model with one-hot categoricals can
    # extrapolate to extreme log-values for rare category combinations,
    # which would otherwise overflow expm1.
    return np.expm1(np.clip(y, 0, 20))
