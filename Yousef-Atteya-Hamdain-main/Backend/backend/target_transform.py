
import numpy as np


def log1p_transform(y):
    return np.log1p(y)


def expm1_inverse_transform(y):
    
    return np.expm1(np.clip(y, 0, 20))
