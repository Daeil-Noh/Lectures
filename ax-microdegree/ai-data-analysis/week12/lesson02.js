// 12주 2차시 전용: 6대 진동 기록, 이상의 세 모양, 720일 격자, 3σ 분포, z-점수 경보, 이동평균, 여러 센서, 무작위 자르기(IsolationForest 원리)
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ───────── 실제 데이터: vibration.csv (설비별 120일 rms·온도·전류) ───────── */
  const V = {"1호기":{"rms":[0.829,1.098,1.0,0.868,0.973,1.007,0.958,0.953,0.91,0.929,0.918,0.912,0.97,0.947,0.959,1.464,1.014,1.033,0.995,0.929,0.894,0.992,0.86,1.103,1.085,0.856,0.944,0.928,0.924,0.952,0.961,0.995,0.961,0.882,0.82,0.99,0.987,0.993,0.914,1.061,1.038,1.055,0.938,0.976,0.966,0.902,0.977,0.999,0.986,0.981,0.984,1.01,0.866,0.966,1.021,1.061,0.898,1.004,0.945,0.984,0.939,0.953,0.99,1.119,0.829,0.974,0.958,0.949,0.856,0.913,0.904,0.891,0.871,1.026,0.874,0.927,0.763,0.946,1.068,0.978,0.938,0.937,0.972,1.014,0.969,1.092,1.026,0.981,0.987,1.016,0.993,0.839,0.922,0.967,0.993,0.971,1.105,1.009,0.919,1.124,0.843,1.029,0.839,0.964,0.952,0.944,1.031,1.11,0.901,0.937,0.99,0.926,1.078,1.087,1.01,0.988,0.944,0.926,0.907,1.024],"temp":[44.9,45.8,44.5,44.1,46.6,44.8,43.4,43.7,44.8,44.2,44.9,44.8,46.5,44.6,44.2,44.2,43.1,46.4,47.0,43.8,45.7,45.6,45.2,45.9,43.7,45.2,45.5,44.8,44.8,45.2,46.0,45.3,47.4,46.0,45.6,43.9,43.4,45.4,45.4,44.3,46.0,46.2,44.9,45.1,46.6,42.1,46.2,45.3,45.6,43.1,46.3,45.2,45.2,46.4,45.3,44.5,45.6,43.2,44.2,45.7,45.0,45.4,45.3,44.2,46.0,45.0,46.3,46.3,45.5,44.8,46.7,44.2,45.0,46.2,44.3,44.2,46.0,45.8,42.5,45.7,45.0,44.8,42.7,44.0,45.1,45.6,45.5,42.5,44.8,45.0,45.4,44.1,44.8,45.1,46.0,44.2,45.2,45.3,44.3,45.8,46.0,46.8,46.0,45.0,45.9,44.6,44.6,45.5,45.8,45.4,45.6,45.2,45.5,46.4,44.3,45.2,44.5,44.1,46.8,45.2],"current":[12.21,11.93,12.16,12.08,11.86,11.91,11.91,11.99,12.87,12.23,12.06,11.71,11.75,12.54,12.07,12.07,11.97,11.69,11.64,12.1,11.43,12.1,11.55,11.6,11.9,11.93,11.91,11.85,11.8,12.19,11.73,11.58,11.81,12.01,11.85,12.39,11.92,12.18,11.93,12.37,12.23,11.21,12.25,12.18,12.29,11.74,12.0,11.79,12.44,11.45,12.26,11.59,12.38,12.09,12.05,12.33,12.42,12.13,12.14,11.6,12.09,12.53,12.12,12.34,11.94,11.99,11.84,11.6,11.56,11.51,12.5,12.17,12.59,11.77,12.58,11.97,11.76,12.17,12.44,12.08,11.69,11.92,11.95,12.09,11.73,11.82,11.85,12.31,12.4,12.04,11.95,11.9,12.26,11.53,12.35,12.12,11.82,11.91,11.97,11.67,12.44,12.62,12.22,12.06,11.19,12.12,12.24,11.86,12.1,11.85,12.43,12.71,11.83,11.63,11.86,11.72,12.24,11.7,11.47,12.06]},"2호기":{"rms":[1.007,0.944,1.049,0.92,0.824,1.196,1.052,0.994,1.03,0.951,0.988,0.932,0.941,0.995,0.943,1.077,1.054,0.985,1.103,0.991,1.077,0.754,0.947,1.015,0.964,0.918,1.0,1.019,1.053,0.908,0.946,0.989,0.935,1.008,0.928,0.881,1.02,0.883,0.99,1.087,0.934,0.998,0.908,1.025,0.986,1.012,0.999,1.063,0.868,0.959,0.879,0.927,0.941,0.937,1.045,0.968,0.861,0.907,0.964,1.032,0.989,1.024,0.887,1.016,1.061,0.929,1.102,1.046,1.042,0.959,0.832,0.921,0.973,0.935,0.92,0.837,1.022,1.026,1.055,0.92,0.947,0.992,0.99,1.043,1.035,1.009,1.078,1.049,0.962,0.951,0.871,0.839,0.908,1.11,0.863,0.89,0.929,1.025,1.05,0.966,0.966,0.877,0.977,1.0,0.895,0.994,0.991,0.953,1.006,1.014,1.002,0.972,0.776,0.927,1.007,1.04,0.922,1.027,0.943,0.973],"temp":[46.0,45.9,45.5,45.9,44.3,44.9,44.0,46.2,43.1,45.0,46.6,44.5,46.5,44.7,44.4,45.1,46.2,44.6,45.5,44.5,46.0,45.2,44.6,45.8,43.7,44.6,46.0,45.0,45.0,44.4,45.1,45.7,45.0,45.0,44.8,45.5,44.6,46.6,45.9,44.3,46.1,45.1,44.6,44.7,46.0,45.1,43.6,45.0,46.4,44.9,44.9,43.9,45.1,45.6,43.4,44.0,45.6,43.8,44.3,44.0,44.0,45.3,45.2,45.3,45.2,45.5,46.4,43.5,46.0,45.6,45.6,43.4,45.0,45.3,44.4,45.3,45.6,44.1,45.8,45.1,44.1,45.3,46.2,44.8,45.6,46.4,45.3,43.2,44.4,45.1,45.4,46.3,45.2,46.1,44.8,44.1,42.7,46.4,45.0,46.9,44.7,44.9,46.5,45.1,45.7,45.6,44.0,43.3,45.8,46.4,45.6,44.6,46.0,45.8,45.3,44.9,44.9,45.3,44.3,46.2],"current":[11.7,12.01,12.2,11.98,11.96,12.06,12.09,11.65,12.27,12.07,11.76,12.12,11.61,11.77,12.1,11.84,11.92,11.91,12.01,11.8,12.14,12.21,11.87,11.47,11.71,11.68,11.94,11.7,11.88,12.39,12.11,11.61,11.9,12.1,11.31,11.63,12.12,11.4,11.58,11.32,12.32,11.92,11.89,11.63,12.48,12.01,11.52,12.4,12.17,11.86,12.17,11.66,12.33,11.78,11.86,12.36,12.07,12.12,11.51,12.39,11.98,12.48,11.72,11.91,12.17,12.1,11.65,11.79,11.97,12.23,12.59,11.82,11.94,12.14,12.49,12.2,12.38,11.89,11.83,12.29,12.57,11.91,12.42,11.83,12.12,12.27,11.91,11.76,12.3,12.16,11.82,11.83,12.23,11.93,12.53,11.85,12.37,11.7,12.21,12.25,11.68,12.71,11.6,11.85,12.4,11.32,11.91,12.72,12.08,12.08,11.48,12.64,12.26,11.86,12.16,12.0,12.0,11.62,11.84,11.66]},"3호기":{"rms":[0.891,1.076,1.066,0.968,0.914,1.003,0.9,0.964,1.085,1.103,0.969,0.984,0.767,0.976,1.047,1.07,0.995,1.018,0.953,0.959,0.929,1.079,0.89,1.021,0.926,1.078,1.408,1.042,1.008,1.034,1.006,1.071,1.009,0.85,1.076,1.031,0.99,1.021,1.046,0.998,0.981,1.033,1.082,0.984,1.06,0.79,1.387,1.316,1.1,0.911,0.836,0.955,1.147,0.985,0.994,1.113,1.12,1.073,0.964,0.891,0.985,0.946,1.026,0.937,1.036,1.144,1.017,1.147,0.901,1.075,1.022,0.97,1.032,1.104,0.98,1.035,1.0,1.113,1.213,1.151,1.282,1.328,1.575,1.508,1.658,1.647,1.875,1.967,2.006,2.169,2.246,2.497,2.443,2.692,2.954,3.116,3.156,0.953,0.908,0.953,0.939,0.919,1.06,0.885,0.928,1.028,0.938,0.935,1.042,0.844,1.005,0.91,0.983,1.117,0.902,0.927,0.909,1.031,0.945,0.984],"temp":[46.6,45.4,43.8,46.7,46.6,47.5,45.3,43.8,44.9,45.3,45.4,44.8,45.1,44.3,44.0,44.9,46.3,45.9,44.1,46.4,44.7,46.7,45.0,46.7,44.9,45.9,45.8,45.8,45.7,43.6,46.2,45.7,43.9,45.7,45.5,47.7,46.4,42.7,44.2,46.2,43.6,44.6,45.3,44.0,44.4,45.3,44.8,44.0,45.0,44.2,46.9,44.0,44.8,46.7,44.1,43.9,46.3,46.0,46.5,45.9,42.3,46.8,44.4,45.0,44.5,43.9,45.5,42.8,44.3,44.2,45.6,46.0,46.6,45.4,45.9,44.4,45.3,45.0,46.9,46.2,47.6,47.2,47.3,50.1,48.9,49.8,48.8,48.3,51.3,52.8,51.2,54.6,54.8,53.6,57.5,58.0,57.1,46.7,44.7,45.0,47.5,45.2,44.2,43.5,45.4,45.6,46.4,47.5,45.1,44.8,43.8,44.6,44.7,46.0,45.2,44.0,43.9,46.0,45.3,46.9],"current":[11.63,12.67,11.63,11.75,12.22,12.06,11.82,11.89,12.59,11.77,12.18,11.51,11.94,11.55,11.91,12.29,11.64,11.8,12.26,11.97,11.93,12.05,11.98,12.1,11.57,12.21,11.61,12.79,12.17,11.88,11.91,12.37,12.15,12.43,11.9,11.88,12.8,12.13,11.52,11.95,12.08,11.49,11.6,11.65,11.64,12.28,12.16,11.66,12.23,12.07,12.07,12.0,12.12,11.82,12.18,12.17,12.22,12.55,12.18,11.96,11.84,12.05,12.61,12.3,12.42,12.1,12.52,12.03,11.99,11.67,12.0,12.05,11.62,11.87,11.6,12.07,12.35,11.86,11.86,12.39,12.94,13.16,12.88,13.26,12.76,13.13,13.72,13.13,13.38,13.94,14.15,13.86,14.44,14.14,14.67,14.91,15.01,11.72,12.22,11.88,11.67,11.82,11.7,11.55,12.0,12.58,12.05,12.42,11.96,11.79,12.22,11.91,12.18,11.99,11.86,11.49,12.7,12.22,11.9,11.91]},"4호기":{"rms":[0.991,0.972,1.041,1.05,1.031,1.056,0.913,1.062,0.947,1.142,1.084,0.999,0.917,1.048,0.984,0.998,1.125,0.97,0.965,1.163,0.905,1.126,1.139,0.804,0.907,0.975,1.027,0.81,0.862,0.983,0.976,1.031,1.051,0.921,0.999,1.036,0.927,0.878,0.869,0.937,0.922,1.044,0.973,0.977,0.933,1.005,1.039,1.037,0.853,1.028,0.975,1.001,0.938,0.947,0.873,1.135,1.074,1.075,1.104,1.209,1.439,1.046,0.926,0.98,1.12,1.082,0.926,0.887,1.0,1.224,0.921,0.994,1.025,0.989,0.927,0.945,1.151,1.062,0.974,0.987,1.079,1.14,1.035,1.152,1.073,0.957,1.047,1.041,1.05,0.914,0.976,0.928,1.001,1.014,1.003,1.048,1.009,1.101,0.992,0.947,0.903,0.995,0.937,0.831,1.069,0.949,0.943,1.058,1.021,0.885,1.009,0.967,0.909,1.097,1.007,1.06,1.016,1.089,1.123,1.033],"temp":[45.1,43.9,43.8,42.6,45.0,45.4,44.6,47.0,44.3,46.2,45.1,46.2,45.0,46.5,43.2,45.7,44.1,44.4,43.0,43.9,46.1,44.8,46.1,45.3,44.8,43.6,43.5,45.8,45.2,45.6,45.2,45.9,44.2,44.4,45.2,44.6,43.2,46.4,45.0,46.3,44.2,45.2,45.8,43.6,46.2,45.2,47.9,44.2,43.9,44.7,44.9,45.7,45.1,45.5,47.0,46.0,45.4,45.5,45.3,43.9,45.9,45.3,45.8,45.0,46.1,44.7,45.0,44.1,44.3,43.7,44.3,47.3,43.7,43.5,46.0,43.6,44.3,44.2,44.1,44.6,47.1,46.0,46.4,46.1,46.6,44.6,44.1,42.8,44.0,44.2,44.3,44.9,45.3,46.1,42.6,46.2,45.6,45.3,45.6,45.7,44.5,45.1,44.0,45.0,44.7,43.7,45.1,43.2,46.2,44.4,44.7,45.2,45.7,45.0,45.2,43.3,44.5,44.0,44.6,44.5],"current":[12.12,11.55,12.3,11.46,12.12,11.42,11.75,11.9,12.1,11.98,11.44,12.06,11.92,11.97,11.53,11.86,12.55,12.72,12.22,12.24,12.23,12.61,12.53,12.09,12.0,12.24,11.62,12.15,12.0,12.41,12.1,11.94,12.11,12.04,12.68,11.89,11.96,11.96,12.32,12.33,11.87,11.99,12.02,11.87,12.13,11.75,12.06,12.02,12.47,12.24,12.26,12.12,12.25,12.06,11.99,11.93,12.03,11.79,12.31,12.02,11.77,11.69,11.86,12.36,11.89,12.05,11.75,11.89,12.22,12.19,12.37,12.14,12.03,11.95,12.08,11.57,12.11,12.0,12.36,12.0,11.82,11.97,11.93,11.82,12.0,12.14,12.23,12.12,11.63,12.27,11.69,12.17,11.69,12.12,12.27,11.62,11.73,11.46,12.33,11.7,11.89,11.99,11.91,12.17,11.5,11.71,12.32,12.09,11.81,12.08,11.74,12.03,12.23,11.84,12.25,11.79,11.88,12.19,12.41,12.52]},"5호기":{"rms":[1.222,0.973,1.097,1.015,1.092,1.046,0.876,0.966,0.901,1.016,1.036,0.962,1.017,1.036,0.988,1.066,1.037,0.948,1.071,1.049,0.941,0.872,1.076,0.993,1.044,1.117,0.99,1.071,0.93,1.137,0.983,1.079,1.015,1.008,0.953,0.889,0.995,1.021,1.176,1.093,1.113,1.065,1.006,1.139,1.202,1.019,1.18,0.925,0.917,0.967,0.951,1.027,1.208,0.934,1.041,0.979,1.145,1.025,1.074,0.805,1.008,1.129,1.059,0.978,1.031,0.968,1.054,1.208,1.037,1.09,0.865,1.021,1.123,1.148,1.013,1.013,1.182,0.943,1.064,1.04,1.047,1.012,1.06,0.853,1.052,1.088,1.016,0.974,0.995,1.236,1.132,1.21,1.171,1.302,1.153,1.226,1.291,1.431,1.692,1.633,1.901,2.399,2.039,2.165,2.196,2.364,2.425,2.831,2.946,3.099,3.191,1.068,1.037,1.089,1.007,1.028,0.927,0.974,0.984,1.368],"temp":[45.1,45.4,46.2,45.2,45.7,46.2,46.5,43.0,45.3,44.6,44.3,45.5,43.2,45.6,46.9,42.9,44.7,44.9,44.6,45.5,45.1,46.0,44.1,45.8,45.0,45.2,45.4,45.7,46.7,44.7,45.4,42.7,46.1,44.1,44.2,43.6,45.7,45.9,45.6,44.8,45.4,44.1,43.7,46.1,44.7,45.1,46.7,43.3,45.7,43.9,41.7,43.8,45.2,45.2,45.7,44.4,43.9,45.5,43.5,45.6,44.2,45.0,45.7,44.8,45.5,44.7,46.0,45.7,45.3,45.5,45.8,45.7,47.0,45.8,44.3,45.0,44.6,44.7,45.4,45.5,45.0,43.3,43.9,43.2,45.3,45.1,45.2,43.7,42.8,44.8,43.6,44.7,46.2,46.6,45.4,46.2,46.3,47.1,48.7,48.7,49.6,49.3,51.9,51.2,53.3,54.2,53.1,56.3,53.9,57.3,59.5,44.8,45.9,46.8,47.4,47.2,45.3,45.4,46.6,47.0],"current":[11.59,11.85,11.79,12.06,11.97,11.47,12.38,12.08,12.44,12.17,11.71,12.51,11.75,12.38,12.27,12.1,12.05,12.41,12.04,12.34,11.64,12.38,11.71,12.56,12.12,12.4,12.15,11.73,12.21,12.2,12.27,11.65,11.8,11.76,12.51,12.3,11.87,12.29,12.11,11.94,11.46,12.3,11.94,11.55,12.56,12.16,12.18,12.43,11.64,11.86,12.54,12.0,11.55,12.38,12.33,12.26,11.75,11.76,12.52,12.21,12.01,11.97,12.11,11.87,11.93,12.09,12.31,11.83,12.0,11.8,11.87,12.45,12.38,11.71,12.2,11.73,12.4,12.36,11.7,11.93,11.75,11.75,12.0,12.14,11.96,12.18,11.84,12.04,11.98,11.72,11.98,12.41,12.51,12.71,12.51,13.02,12.55,12.79,12.88,13.09,13.3,12.93,13.37,13.87,13.76,13.9,14.11,14.83,14.39,15.23,15.8,11.79,11.63,11.8,12.24,12.11,11.92,12.3,11.49,11.8]},"6호기":{"rms":[1.196,1.046,0.98,1.037,0.947,1.09,0.984,1.103,1.197,0.992,1.057,1.116,1.188,0.972,1.037,0.989,1.021,1.033,0.983,0.969,0.997,1.115,0.916,0.924,1.077,1.01,1.046,0.975,0.989,0.986,1.191,1.115,1.022,1.192,1.065,1.179,1.097,0.893,1.13,1.023,1.006,1.012,0.998,1.01,1.006,0.974,1.191,1.066,1.049,1.057,1.088,1.087,1.154,0.832,1.092,0.967,1.025,1.049,1.004,1.166,1.162,1.113,1.103,0.89,0.848,1.25,0.959,1.112,0.965,1.008,1.044,1.045,1.118,0.972,0.977,1.029,1.078,1.109,1.087,1.075,1.154,1.137,0.951,1.128,0.983,1.017,1.085,1.086,1.145,0.971,1.092,1.02,0.94,0.964,1.148,0.985,0.984,1.006,1.083,1.078,0.956,1.14,1.088,1.123,1.405,1.125,1.117,1.123,0.881,1.042,1.227,0.968,1.042,0.972,1.114,1.048,1.076,0.991,1.201,1.144],"temp":[45.7,44.5,45.5,44.3,45.0,44.4,44.5,43.7,44.8,44.8,45.5,44.8,43.8,44.7,43.9,47.1,44.0,45.8,44.6,44.7,45.5,46.3,45.0,44.2,45.2,45.7,46.2,44.5,45.9,46.0,44.3,43.9,45.0,46.4,45.9,44.3,46.7,43.3,45.5,45.4,43.9,45.1,47.3,42.5,45.5,44.8,43.6,44.6,44.4,45.5,45.2,45.3,44.6,45.6,46.2,44.6,45.6,46.8,45.7,44.6,45.6,44.3,44.5,43.3,45.2,45.4,46.5,46.4,45.3,44.8,45.2,45.7,44.9,45.4,46.1,46.2,42.7,42.8,44.1,45.8,44.6,44.9,44.3,45.1,44.1,45.7,44.5,45.1,45.3,43.7,43.9,44.4,45.8,43.8,46.3,45.3,43.3,43.7,44.7,46.8,44.4,43.1,46.9,45.1,43.6,44.0,44.4,43.9,44.5,45.7,44.9,45.9,44.6,44.9,46.7,45.4,45.2,44.5,45.1,46.3],"current":[11.34,11.82,12.23,12.19,11.87,12.24,11.77,12.31,12.24,12.38,11.88,11.46,11.98,11.35,11.72,11.8,11.82,12.28,11.3,12.6,11.71,11.92,12.2,12.3,11.63,11.98,12.51,12.28,12.4,12.21,11.97,11.36,11.73,12.41,11.94,11.86,12.17,11.77,12.37,12.01,11.99,12.16,11.57,12.36,12.31,12.57,11.51,11.53,11.61,12.37,11.59,12.28,11.7,11.98,12.46,12.05,12.03,11.66,12.48,12.35,11.99,11.67,11.74,12.39,11.87,12.47,11.66,12.25,11.79,12.05,12.19,11.79,11.38,11.4,11.94,11.62,12.01,11.78,11.92,11.67,12.78,11.95,11.77,11.75,12.29,12.13,12.17,12.12,11.87,11.98,12.0,11.9,11.64,11.89,11.61,12.01,12.09,11.57,12.12,11.56,11.93,11.66,11.93,12.37,12.38,12.03,11.57,12.18,11.8,11.54,12.18,11.9,12.36,12.52,12.23,11.92,12.22,12.05,11.96,12.21]}};
  const FAIL = { '3호기': 96, '5호기': 110 };
  const BASE = 60;                     // 1~60일 = 정상 기준 구간
  const stat = (a) => { const m = a.reduce((s, x) => s + x, 0) / a.length; const sd = Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); return { m, sd }; };  // pandas std (n−1)
  const M3 = V['3호기'];
  const S3 = { rms: stat(M3.rms.slice(0, BASE)), temp: stat(M3.temp.slice(0, BASE)), current: stat(M3.current.slice(0, BASE)) };
  const LINE3 = S3.rms.m + 3 * S3.rms.sd;   // 3σ 선
  const rolling = (a, w) => a.map((_, i) => i < w - 1 ? null : a.slice(i - w + 1, i + 1).reduce((s, x) => s + x, 0) / w);
  // 3호기 평가: 1~96일만, 67~96일(고장 전 30일)의 경보 = 맞은 경보, 그 전 = 잘못 경보
  function judge(alarm) {
    const fa = [], hit = [];
    for (let d = 1; d <= 96; d++) if (alarm[d - 1]) (d <= 66 ? fa : hit).push(d);
    return { fa, first: hit.length ? hit[0] : null };
  }
  window.__w12v = { S3, LINE3, judge, rolling, M3 };   // 점검용

  /* 공통 좌표틀 */
  function frame(svg, o) {
    const X = (d) => o.L + (d - o.x0) / (o.x1 - o.x0) * (o.R - o.L);
    const Y = (v) => o.B - (v - o.y0) / (o.y1 - o.y0) * (o.B - o.T);
    (o.yt || []).forEach((v) => {
      el('line', { x1: o.L, x2: o.R, y1: Y(v), y2: Y(v), class: 'p-grid' }, svg);
      el('text', { x: o.L - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = o.yf ? o.yf(v) : v;
    });
    (o.xt || []).forEach((d) => el('text', { x: X(d), y: o.B + 18, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = d + (o.xs || ''));
    el('line', { x1: o.L, x2: o.R, y1: o.B, y2: o.B, class: 'p-axis' }, svg);
    if (o.xl) el('text', { x: (o.L + o.R) / 2, y: o.B + 42, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = o.xl;
    if (o.yl) el('text', { x: 14, y: (o.T + o.B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 14 ${(o.T + o.B) / 2})` }, svg).textContent = o.yl;
    return { X, Y };
  }
  const pts = (a, X, Y, d0) => a.map((v, i) => v === null ? null : X(i + (d0 || 1)).toFixed(1) + ',' + Y(v).toFixed(1)).filter(Boolean).join(' ');

  /* ───────── 1) 6대 진동 기록 ───────── */
  (function multi() {
    const svg = $('multi6'); if (!svg) return;
    Object.keys(V).sort().forEach((m, k) => {
      const ox = (k % 3) * 373, oy = Math.floor(k / 3) * 205;
      const g = el('g', { transform: `translate(${ox} ${oy})` }, svg);
      const fail = FAIL[m];
      el('rect', { x: 2, y: 2, width: 366, height: 196, rx: 14, class: 'f-surface', stroke: fail ? 'var(--accent-2)' : 'var(--line)', 'stroke-width': fail ? 2 : 1.5 }, g);
      el('text', { x: 18, y: 28, class: 't-main', style: 'font-size:17px' }, g).textContent = m;
      if (fail) el('text', { x: 352, y: 28, 'text-anchor': 'end', class: 't-acc2', style: 'font-size:14px' }, g).textContent = fail + '일째 고장';
      else el('text', { x: 352, y: 28, 'text-anchor': 'end', class: 't-sub', style: 'font-size:14px' }, g).textContent = '고장 없음';
      const F = frame(g, { L: 44, R: 354, T: 40, B: 168, x0: 1, x1: 120, y0: 0.6, y1: 3.3, yt: [1, 2, 3], xt: [1, 30, 60, 90, 120], xs: '' });
      if (fail) el('line', { x1: F.X(fail), x2: F.X(fail), y1: 40, y2: 168, stroke: 'var(--bad)', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, g);
      el('polyline', { points: pts(V[m].rms, F.X, F.Y), fill: 'none', stroke: fail ? 'var(--accent-2)' : 'var(--accent)', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    });
  })();

  /* ───────── 2) 이상의 세 모양 (작은 그래프) ───────── */
  (function spark() {
    const s1 = $('sp-spike');
    if (s1) {
      const a = M3.rms.slice(14, 40), F = frame(s1, { L: 8, R: 292, T: 10, B: 110, x0: 15, x1: 40, y0: 0.7, y1: 1.5 });
      el('line', { x1: 8, x2: 292, y1: F.Y(LINE3), y2: F.Y(LINE3), stroke: 'var(--accent-2)', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, s1);
      el('polyline', { points: pts(a, F.X, F.Y, 15), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5 }, s1);
      el('circle', { cx: F.X(27), cy: F.Y(M3.rms[26]), r: 8, fill: 'none', stroke: 'var(--bad)', 'stroke-width': 2.5 }, s1);
    }
    const s2 = $('sp-trend');
    if (s2) {
      const a = M3.rms.slice(49, 96), F = frame(s2, { L: 8, R: 292, T: 10, B: 110, x0: 50, x1: 96, y0: 0.7, y1: 3.2 });
      el('rect', { x: F.X(72), y: 10, width: F.X(96) - F.X(72), height: 100, fill: 'var(--accent-2)', 'fill-opacity': 0.08 }, s2);
      el('polyline', { points: pts(a, F.X, F.Y, 50), fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 2.5 }, s2);
    }
    const s3 = $('sp-combo');
    if (s3) {
      const F = frame(s3, { L: 8, R: 292, T: 10, B: 110, x0: 66, x1: 84, y0: -2.5, y1: 5.5 });
      el('line', { x1: 8, x2: 292, y1: F.Y(3), y2: F.Y(3), stroke: 'var(--bad)', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, s3);
      [['rms', 'var(--accent)'], ['temp', 'var(--accent-2)'], ['current', 'var(--ok)']].forEach(([c, col]) => {
        const z = M3[c].slice(65, 84).map((v) => Math.min(5.4, (v - S3[c].m) / S3[c].sd));
        el('polyline', { points: pts(z, F.X, F.Y, 66), fill: 'none', stroke: col, 'stroke-width': 2.2 }, s3);
      });
      el('line', { x1: F.X(81), x2: F.X(81), y1: 10, y2: 110, stroke: 'var(--muted)', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, s3);
      [['진동', 'var(--accent)'], ['온도', 'var(--accent-2)'], ['전류', 'var(--ok)']].forEach(([t, col], i) => el('text', { x: 14 + i * 40, y: 106, class: 'p-tick', style: `fill:${col};font-weight:800;font-size:12px` }, s3).textContent = t);
      el('text', { x: 14, y: F.Y(3) - 5, class: 'p-tick', style: 'fill:var(--bad);font-size:11px' }, s3).textContent = 'z = 3';
      el('text', { x: F.X(81) - 4, y: 106, 'text-anchor': 'end', class: 'p-tick', style: 'font-size:11px' }, s3).textContent = '81일';
    }
  })();

  /* ───────── 3) 720일 격자 ───────── */
  (function cells() {
    const svg = $('cells720'); if (!svg) return;
    const L = 70, W = (1110 - L) / 120, H = 30;
    Object.keys(V).sort().forEach((m, r) => {
      const y = 8 + r * (H + 6);
      el('text', { x: L - 10, y: y + 21, 'text-anchor': 'end', class: 't-main', style: 'font-size:15px' }, svg).textContent = m;
      for (let d = 1; d <= 120; d++) {
        const f = FAIL[m];
        const isF = f === d, wear = f && d > f - 25 && d < f;
        el('rect', { x: L + (d - 1) * W + 0.6, y, width: W - 1.2, height: H, rx: 2, fill: isF ? 'var(--bad)' : wear ? 'var(--accent-2-soft)' : 'var(--surface-2)' }, svg);
      }
    });
    const fy = 8 + 6 * (H + 6) + 4;
    el('text', { x: L, y: fy + 12, class: 't-sub', style: 'font-size:14px' }, svg).textContent = '1일';
    el('text', { x: 1110, y: fy + 12, 'text-anchor': 'end', class: 't-sub', style: 'font-size:14px' }, svg).textContent = '120일';
    el('rect', { x: 430, y: fy, width: 14, height: 14, rx: 2, fill: 'var(--bad)' }, svg);
    el('text', { x: 450, y: fy + 12, class: 't-sub', style: 'font-size:14px;fill:var(--text);font-weight:700' }, svg).textContent = '고장 표시(failure = 1) 2칸';
    el('rect', { x: 640, y: fy, width: 14, height: 14, rx: 2, fill: 'var(--accent-2-soft)', stroke: 'var(--accent-2)' }, svg);
    el('text', { x: 660, y: fy + 12, class: 't-sub', style: 'font-size:14px' }, svg).textContent = '마모 진행 중(표시 없음)';
  })();

  /* ───────── 4) 정상 구간 분포와 3σ ───────── */
  (function hist() {
    const svg = $('hist'); if (!svg) return;
    const a = M3.rms.slice(0, BASE);
    const b0 = 0.65, bw = 0.05, nb = 17;
    const cnt = Array(nb).fill(0); a.forEach((v) => { const i = Math.floor((v - b0) / bw); if (i >= 0 && i < nb) cnt[i]++; });
    const F = frame(svg, { L: 46, R: 506, T: 40, B: 320, x0: b0, x1: b0 + nb * bw, y0: 0, y1: 16, yt: [0, 5, 10, 15], xl: '3호기 1~60일 rms →', yl: '날수' });
    [0.7, 0.9, 1.1, 1.3, 1.5].forEach((v) => el('text', { x: F.X(v), y: 338, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = v.toFixed(1));
    cnt.forEach((c, i) => { if (c) el('rect', { x: F.X(b0 + i * bw) + 1, y: F.Y(c), width: F.X(bw) - F.X(0) - 2, height: F.Y(0) - F.Y(c), rx: 3, fill: 'var(--accent)', 'fill-opacity': b0 + i * bw >= LINE3 - 0.04 ? 1 : 0.45 }, svg); });
    const m = S3.rms.m, sd = S3.rms.sd;
    el('line', { x1: F.X(m), x2: F.X(m), y1: 34, y2: 320, stroke: 'var(--text)', 'stroke-width': 2 }, svg);
    el('text', { x: F.X(m), y: 28, 'text-anchor': 'middle', class: 't-main', style: 'font-size:14px' }, svg).textContent = '평균 ' + m.toFixed(3);
    [-3, 3].forEach((k) => {
      const x = F.X(m + k * sd);
      el('line', { x1: x, x2: x, y1: 52, y2: 320, stroke: 'var(--accent-2)', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, svg);
      el('text', { x: x + 6, y: 66, 'text-anchor': 'start', class: 't-acc2', style: 'font-size:14px' }, svg).textContent = (k > 0 ? '+3σ ' : '−3σ ') + (m + k * sd).toFixed(2);
    });
    el('path', { d: `M${F.X(m)},92 H${F.X(m + sd)}`, stroke: 'var(--muted)', 'stroke-width': 2, 'marker-end': 'url(#ahh)' }, svg);
    el('defs', {}, svg).innerHTML = '<marker id="ahh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--muted)"/></marker>';
    el('text', { x: F.X(m) + 4, y: 86, class: 't-sub', style: 'font-size:13px' }, svg).textContent = 'σ = ' + sd.toFixed(3);
    el('text', { x: F.X(1.42), y: F.Y(2) - 8, 'text-anchor': 'middle', class: 't-sub', style: 'font-size:12.5px;fill:var(--bad);font-weight:700' }, svg).textContent = '27·47일 튐';
  })();

  /* ───────── 3호기 시계열 그림 공통 (1~96일) ───────── */
  function plot3(svg, yMax) {
    const o = { L: 56, R: 620, T: 30, B: 360, x0: 1, x1: 96, y0: 0.6, y1: yMax || 3.3, yt: [1, 1.5, 2, 2.5, 3], yf: (v) => v.toFixed(1), xt: [1, 20, 40, 60, 80, 96], xs: '일', xl: '날짜 →', yl: '진동 세기 rms →' };
    const F = frame(svg, o);
    el('rect', { x: F.X(1), y: o.T, width: F.X(60) - F.X(1), height: o.B - o.T, fill: 'var(--accent)', 'fill-opacity': 0.05 }, svg);
    el('text', { x: F.X(30), y: o.T + 16, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:700' }, svg).textContent = '정상 기준 구간 (1~60일)';
    el('rect', { x: F.X(66.5), y: o.T, width: F.X(96) - F.X(66.5), height: o.B - o.T, fill: 'var(--accent-2)', 'fill-opacity': 0.07 }, svg);
    el('text', { x: F.X(81), y: o.T + 16, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:700;fill:var(--accent-2)' }, svg).textContent = '고장 전 30일';
    el('line', { x1: F.X(96), x2: F.X(96), y1: o.T, y2: o.B, stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, svg);
    el('text', { x: F.X(96) - 5, y: o.T + 34, 'text-anchor': 'end', class: 'p-tick', style: 'fill:var(--bad);font-weight:800' }, svg).textContent = '96일 고장';
    return F;
  }
  function marks(g, F, vals, res) {
    g.innerHTML = '';
    res.fa.forEach((d) => {
      el('circle', { cx: F.X(d), cy: F.Y(vals[d - 1]), r: 9, fill: 'none', stroke: 'var(--bad)', 'stroke-width': 3 }, g);
    });
    if (res.fa.length) {
      const d = res.fa[0];
      el('text', { x: F.X(d), y: F.Y(vals[d - 1]) - 16, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:800;fill:var(--bad)' }, g).textContent = '잘못 경보';
    }
    if (res.first) {
      const d = res.first, x = F.X(d), y = F.Y(vals[d - 1]);
      el('circle', { cx: x, cy: y, r: 10, fill: 'var(--accent-2)' }, g);
      el('text', { x: x - 14, y: y - 4, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:800;fill:var(--accent-2);font-size:14px' }, g).textContent = d + '일 첫 경보';
      el('path', { d: `M${x},${F.Y(0.62)} H${F.X(96)}`, stroke: 'var(--accent-2)', 'stroke-width': 3 }, g);
      el('text', { x: (x + F.X(96)) / 2, y: F.Y(0.62) - 8, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:800;fill:var(--accent-2)' }, g).textContent = (96 - d) + '일 전';
    }
  }
  const days96 = (a) => a.slice(0, 96);

  /* ───────── 5) z-점수 경보 ───────── */
  (function zDemo() {
    const svg = $('zplot'); if (!svg) return;
    const F = plot3(svg);
    const r = days96(M3.rms);
    el('line', { x1: F.X(1), x2: F.X(96), y1: F.Y(S3.rms.m), y2: F.Y(S3.rms.m), stroke: 'var(--muted)', 'stroke-width': 1.5, 'stroke-dasharray': '2 4' }, svg);
    el('polyline', { points: pts(r, F.X, F.Y), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
    r.forEach((v, i) => el('circle', { cx: F.X(i + 1), cy: F.Y(v), r: 2.6, fill: 'var(--accent)' }, svg));
    const th = el('line', { x1: F.X(1), x2: F.X(96), stroke: 'var(--accent-2)', 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, svg);
    const tt = el('text', { x: F.X(2), class: 'p-tick', style: 'fill:var(--accent-2);font-weight:800' }, svg);
    const g = el('g', {}, svg);
    const s = $('z-k');
    function update() {
      const k = +s.value, line = S3.rms.m + k * S3.rms.sd;
      $('z-k-o').textContent = k.toFixed(1);
      $('z-line').textContent = `= rms ${line.toFixed(2)} 넘으면 경보 (평균 ${S3.rms.m.toFixed(3)} + ${k.toFixed(1)} × ${S3.rms.sd.toFixed(3)})`;
      th.setAttribute('y1', F.Y(line)); th.setAttribute('y2', F.Y(line));
      tt.setAttribute('y', F.Y(line) - 7); tt.textContent = `z = ${k.toFixed(1)} (rms ${line.toFixed(2)})`;
      const res = judge(r.map((v) => (v - S3.rms.m) / S3.rms.sd > k));
      marks(g, F, r, res);
      $('z-first').textContent = res.first ? res.first + '일째' : '놓침';
      $('z-lead').textContent = res.first ? `고장 ${96 - res.first}일 전` : '고장까지 경보 없음';
      $('z-fa').textContent = res.fa.length + '일';
      $('z-fad').textContent = res.fa.length ? res.fa.join('·') + '일' : '없음';
      $('z-msg').innerHTML = res.fa.length > 2 ? `기준이 낮아 <strong>정상 구간의 튐 ${res.fa.length}번</strong>에도 경보. 대신 고장 <strong>${96 - res.first}일 전</strong>에 알아챕니다.`
        : res.fa.length ? `3σ에서도 27·47일의 <strong>순간 튐</strong>이 걸립니다. 첫 진짜 경보는 고장 <strong>${96 - res.first}일 전</strong>.`
        : res.first && 96 - res.first >= 12 ? `잘못 경보 없이 고장 <strong>${96 - res.first}일 전</strong>에 경보. 이 설비에서는 좋은 기준입니다.`
        : res.first ? `기준이 높아 잘못 경보는 없지만, 고장 <strong>${96 - res.first}일 전</strong>에야 알아챕니다. 정비가 빠듯합니다.`
        : '경보 없이 <strong>고장</strong>! 기준이 너무 높습니다.';
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 6) 이동평균 설명 그림 (20~34일) ───────── */
  (function maExp() {
    const svg = $('maexp'); if (!svg) return;
    const F = frame(svg, { L: 56, R: 620, T: 30, B: 300, x0: 19.5, x1: 34.5, y0: 0.8, y1: 1.5, yt: [0.9, 1.1, 1.3, 1.5], yf: (v) => v.toFixed(1), xt: [20, 22, 24, 26, 28, 30, 32, 34], xs: '일', xl: '날짜 →', yl: 'rms →' });
    const ma = rolling(M3.rms, 7);
    el('rect', { x: F.X(20.6), y: 36, width: F.X(27.4) - F.X(20.6), height: 258, rx: 10, fill: 'var(--accent)', 'fill-opacity': 0.07, stroke: 'var(--accent)', 'stroke-dasharray': '5 4' }, svg);
    el('text', { x: F.X(24), y: 54, 'text-anchor': 'middle', class: 't-acc', style: 'font-size:14px' }, svg).textContent = '최근 7일 (21~27일)';
    el('line', { x1: F.X(19.5), x2: F.X(34.5), y1: F.Y(LINE3), y2: F.Y(LINE3), stroke: 'var(--accent-2)', 'stroke-width': 2, 'stroke-dasharray': '7 5' }, svg);
    el('text', { x: F.X(34.4), y: F.Y(LINE3) - 7, 'text-anchor': 'end', class: 'p-tick', style: 'fill:var(--accent-2);font-weight:800' }, svg).textContent = '3σ 선 1.36';
    const raw = [], mav = [];
    for (let d = 20; d <= 34; d++) { raw.push(F.X(d) + ',' + F.Y(M3.rms[d - 1])); mav.push(F.X(d) + ',' + F.Y(ma[d - 1])); }
    el('polyline', { points: raw.join(' '), fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.5, opacity: 0.7 }, svg);
    for (let d = 20; d <= 34; d++) el('circle', { cx: F.X(d), cy: F.Y(M3.rms[d - 1]), r: 5, fill: 'var(--muted)', opacity: 0.7 }, svg);
    el('polyline', { points: mav.join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 4, 'stroke-linejoin': 'round' }, svg);
    el('circle', { cx: F.X(27), cy: F.Y(M3.rms[26]), r: 10, fill: 'none', stroke: 'var(--bad)', 'stroke-width': 3 }, svg);
    el('text', { x: F.X(27) + 14, y: F.Y(M3.rms[26]) + 5, class: 'p-tick', style: 'fill:var(--bad);font-weight:800;font-size:14px' }, svg).textContent = '27일 튐 ' + M3.rms[26].toFixed(2);
    el('circle', { cx: F.X(27), cy: F.Y(ma[26]), r: 7, fill: 'var(--accent)' }, svg);
    el('text', { x: F.X(27) + 12, y: F.Y(ma[26]) + 34, class: 't-acc', style: 'font-size:14px' }, svg).textContent = '7일 평균 ' + ma[26].toFixed(2);
    el('text', { x: 60, y: 350, class: 't-sub', style: 'font-size:14px' }, svg).textContent = '● 원래 값      — 7일 이동평균';
  })();

  /* ───────── 7) 이동평균 기간 고르기 ───────── */
  (function maDemo() {
    const svg = $('maplot'); if (!svg) return;
    const F = plot3(svg);
    const r = days96(M3.rms);
    el('polyline', { points: pts(r, F.X, F.Y), fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.2, opacity: 0.55 }, svg);
    r.forEach((v, i) => el('circle', { cx: F.X(i + 1), cy: F.Y(v), r: 2.4, fill: 'var(--muted)', opacity: 0.6 }, svg));
    el('line', { x1: F.X(1), x2: F.X(96), y1: F.Y(LINE3), y2: F.Y(LINE3), stroke: 'var(--accent-2)', 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, svg);
    el('text', { x: F.X(2), y: F.Y(LINE3) - 7, class: 'p-tick', style: 'fill:var(--accent-2);font-weight:800' }, svg).textContent = '3σ 선 1.36';
    const line = el('polyline', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3.2, 'stroke-linejoin': 'round' }, svg);
    const g = el('g', {}, svg);
    const W = [1, 3, 5, 7, 10, 14];
    const s = $('ma-w');
    function update() {
      const w = W[+s.value];
      $('ma-w-o').textContent = w === 1 ? '1일 (이동평균 없음)' : w + '일';
      const ma = days96(rolling(M3.rms, w));
      line.setAttribute('points', pts(ma, F.X, F.Y));
      const res = judge(ma.map((v) => v !== null && v > LINE3));
      marks(g, F, ma.map((v, i) => v === null ? r[i] : v), res);
      $('ma-first').textContent = res.first ? res.first + '일째' : '놓침';
      $('ma-lead').textContent = res.first ? `고장 ${96 - res.first}일 전` : '';
      $('ma-fa').textContent = res.fa.length + '일';
      $('ma-fad').textContent = res.fa.length ? res.fa.join('·') + '일' : '없음';
      const lead = res.first ? 96 - res.first : 0;
      $('ma-msg').innerHTML = w === 1 ? `원래 값 그대로: 27·47일 <strong>순간 튐이 잘못 경보</strong>. 첫 경보는 고장 ${lead}일 전.`
        : res.fa.length ? `${w}일 평균으로도 튐이 남습니다.`
        : w <= 3 ? `${w}일 평균만으로 <strong>잘못 경보 0</strong>. 첫 경보는 고장 <strong>${lead}일 전</strong> 그대로.`
        : `튐은 사라졌지만 평균이 천천히 올라 첫 경보가 고장 <strong>${lead}일 전</strong>으로 늦어졌습니다. 기간이 길수록 <strong>느린 경보</strong>.`;
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 8) 센서 셋 나란히 ───────── */
  (function multiSensor() {
    const svg = $('msplot'); if (!svg) return;
    const P = [
      { c: 'rms', n: '진동 rms', col: 'var(--accent)', y0: 0.6, y1: 3.3, yt: [1, 2, 3] },
      { c: 'temp', n: '온도 ℃', col: 'var(--accent-2)', y0: 41, y1: 60, yt: [45, 50, 55] },
      { c: 'current', n: '전류 A', col: 'var(--ok)', y0: 11, y1: 15.5, yt: [12, 13, 14, 15] },
    ];
    const L = 56, R = 620, H = 112, G = 18;
    let X;
    P.forEach((p, k) => {
      const T = 10 + k * (H + G), B = T + H;
      const F = frame(svg, { L, R, T, B, x0: 1, x1: 96, y0: p.y0, y1: p.y1, yt: p.yt, xt: k === 2 ? [1, 20, 40, 60, 80, 96] : [], xs: '일' });
      X = F.X;
      const line3 = S3[p.c].m + 3 * S3[p.c].sd;
      el('line', { x1: L, x2: R, y1: F.Y(line3), y2: F.Y(line3), stroke: 'var(--bad)', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, svg);
      el('polyline', { points: pts(days96(M3[p.c]), F.X, F.Y), fill: 'none', stroke: p.col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, svg);
      el('text', { x: L + 8, y: T + 16, class: 'p-lab', style: `fill:${p.col}` }, svg).textContent = p.n;
    });
    el('text', { x: L + 110, y: 26, class: 'p-tick', style: 'fill:var(--bad);font-weight:700' }, svg).textContent = '빨간 점선 = 각 센서의 3σ 선';
    const cur = el('line', { y1: 6, y2: 10 + 2 * (H + G) + H, stroke: 'var(--text)', 'stroke-width': 2 }, svg);
    const s = $('ms-d');
    function update() {
      const d = +s.value;
      $('ms-d-o').textContent = d + '일째';
      cur.setAttribute('x1', X(d)); cur.setAttribute('x2', X(d));
      const z = P.map((p) => (M3[p.c][d - 1] - S3[p.c].m) / S3[p.c].sd);
      z.forEach((v, i) => {
        $('ms-z' + i).textContent = (v >= 0 ? '+' : '') + v.toFixed(1);
        const b = $('ms-b' + i);
        b.style.width = Math.max(0, Math.min(6, v)) / 6 * 100 + '%';
        b.style.background = v > 3 ? 'var(--accent-2)' : v > 2 ? 'var(--accent)' : 'var(--muted)';
      });
      const over3 = z.filter((v) => v > 3).length, over2 = z.filter((v) => v > 2).length;
      $('ms-msg').innerHTML = over3 === 1 && z[0] > 3 && z[1] < 2 && z[2] < 2 ? '<strong>진동만</strong> 튀고 온도·전류는 평소 그대로. 하루짜리 충격이나 센서 잡음일 가능성이 큽니다.'
        : over3 === 0 && over2 >= 2 ? `어느 센서도 3σ를 넘지 않았지만 <strong>${over2}개가 함께</strong> z &gt; 2. 따로 보면 놓치고, <strong>함께 보면 수상한 날</strong>입니다.`
        : over3 >= 2 ? `<strong>${over3}개 센서가 동시에</strong> 3σ를 넘었습니다. 진동·발열·부하가 함께 커지는 전형적인 <strong>마모 징후</strong>.`
        : over3 === 1 ? '센서 하나만 3σ를 넘었습니다. 다른 센서도 따라 오르는지 지켜봅니다.'
        : '세 센서 모두 평소 범위 안입니다.';
    }
    s.addEventListener('input', update);
    document.querySelectorAll('.chips [data-d]').forEach((b) => b.addEventListener('click', () => { s.value = b.dataset.d; update(); }));
    update();
  })();

  /* ───────── 9) 무작위로 잘라 고립시키기 (IsolationForest의 원리) ───────── */
  (function iso() {
    const svg = $('isoplot'); if (!svg) return;
    const D = days96(M3.rms).map((v, i) => [v, M3.temp[i]]);
    const F = frame(svg, { L: 60, R: 620, T: 20, B: 356, x0: 0.7, x1: 3.2, y0: 42, y1: 59, yt: [44, 48, 52, 56], xt: [], xl: '진동 rms →', yl: '온도 (℃) →' });
    [1, 1.5, 2, 2.5, 3].forEach((v) => el('text', { x: F.X(v), y: 374, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = v.toFixed(1));
    const cuts = el('g', {}, svg), box = el('rect', { fill: 'var(--accent-2)', 'fill-opacity': 0.08, stroke: 'var(--accent-2)', 'stroke-width': 2 }, svg);
    const dots = D.map((p) => el('circle', { cx: F.X(p[0]), cy: F.Y(p[1]), r: 5, fill: 'var(--accent)', 'fill-opacity': 0.6 }, svg));
    const ring = el('circle', { r: 11, fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 3.5 }, svg);
    let target = 29, busy = false;
    const r = rng(12);
    // 한 번의 고립 과정: [자르기 목록, 횟수]
    function isolate(rand) {
      let idx = D.map((_, i) => i);
      let lo = [Math.min(...D.map((p) => p[0])), Math.min(...D.map((p) => p[1]))], hi = [Math.max(...D.map((p) => p[0])), Math.max(...D.map((p) => p[1]))];
      const steps = [];
      let guard = 0;
      while (idx.length > 1 && steps.length < 40 && guard++ < 400) {
        const f = rand() < 0.5 ? 0 : 1;
        const mn = Math.min(...idx.map((i) => D[i][f])), mx = Math.max(...idx.map((i) => D[i][f]));
        if (mx === mn) continue;
        const c = mn + rand() * (mx - mn);
        const left = D[target][f] < c;
        steps.push({ f, c, lo: lo.slice(), hi: hi.slice() });
        idx = idx.filter((i) => (D[i][f] < c) === left);
        if (left) hi[f] = Math.min(hi[f], c); else lo[f] = Math.max(lo[f], c);
        steps[steps.length - 1].after = { lo: lo.slice(), hi: hi.slice(), n: idx.length };
      }
      return steps;
    }
    window.__w12iso = (t, n) => { const save = target; target = t; const rr = rng(99); let s = 0; for (let k = 0; k < n; k++) s += isolate(rr).length; target = save; return s / n; };
    function setTarget(t) {
      target = t; cuts.innerHTML = ''; box.setAttribute('width', 0);
      ring.setAttribute('cx', F.X(D[t][0])); ring.setAttribute('cy', F.Y(D[t][1]));
      dots.forEach((d, i) => d.setAttribute('fill', 'var(--accent)'));
      $('iso-n').setAttribute('aria-pressed', t === 29); $('iso-a').setAttribute('aria-pressed', t === 94);
      $('iso-cnt').textContent = '-'; $('iso-avg').textContent = '-';
      $('iso-msg').innerHTML = (t === 29 ? '<strong>30일째</strong>: 평소와 비슷한 날. 주변에 비슷한 점이 많습니다.' : '<strong>95일째</strong>: 고장 하루 전. 진동·온도가 모두 높습니다.') + ' <strong>무작위로 자르기</strong>를 눌러 보세요.';
    }
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    async function run() {
      if (busy) return; busy = true; $('iso-run').disabled = true;
      cuts.innerHTML = '';
      const steps = isolate(r);
      for (const st of steps) {
        const x1 = st.f === 0 ? F.X(st.c) : F.X(st.lo[0]), x2 = st.f === 0 ? F.X(st.c) : F.X(st.hi[0]);
        const y1 = st.f === 1 ? F.Y(st.c) : F.Y(st.lo[1]), y2 = st.f === 1 ? F.Y(st.c) : F.Y(st.hi[1]);
        el('line', { x1, x2, y1, y2, stroke: 'var(--text)', 'stroke-width': 1.6, opacity: 0.7 }, cuts);
        const a = st.after;
        box.setAttribute('x', F.X(a.lo[0])); box.setAttribute('width', Math.max(2, F.X(a.hi[0]) - F.X(a.lo[0])));
        box.setAttribute('y', F.Y(a.hi[1])); box.setAttribute('height', Math.max(2, F.Y(a.lo[1]) - F.Y(a.hi[1])));
        dots.forEach((d, i) => { const p = D[i], inside = p[0] >= a.lo[0] && p[0] <= a.hi[0] && p[1] >= a.lo[1] && p[1] <= a.hi[1]; d.setAttribute('fill', inside ? 'var(--accent)' : 'var(--muted)'); });
        $('iso-cnt').textContent = cuts.childNodes.length + '번';
        await wait(steps.length > 8 ? 160 : 380);
      }
      $('iso-msg').innerHTML = `<strong>${steps.length}번</strong> 잘라서 ${target + 1}일째 점이 혼자 남았습니다. ` + (target === 94 ? '멀리 떨어진 점은 <strong>몇 번 만에</strong> 고립됩니다 → 이상 점수가 높다.' : '비슷한 점이 많아 <strong>여러 번</strong> 잘라야 고립됩니다 → 정상에 가깝다.') + ' 한 번은 운일 수 있으니 <strong>100번 평균</strong>도 보세요.';
      busy = false; $('iso-run').disabled = false;
    }
    $('iso-run').addEventListener('click', run);
    $('iso-100').addEventListener('click', () => {
      if (busy) return;
      let s = 0; for (let k = 0; k < 100; k++) s += isolate(r).length;
      const avg = s / 100;
      $('iso-avg').textContent = avg.toFixed(1) + '번';
      $('iso-msg').innerHTML = `100번 평균 <strong>${avg.toFixed(1)}번</strong>. ` + (target === 94 ? '평범한 날(30일째)과 비교해 보세요 — 훨씬 적습니다.' : '95일째와 비교해 보세요.') + ' IsolationForest는 이렇게 <strong>평균 자른 횟수가 적을수록</strong> 이상으로 봅니다.';
    });
    $('iso-n').addEventListener('click', () => { if (!busy) setTarget(29); });
    $('iso-a').addEventListener('click', () => { if (!busy) setTarget(94); });
    setTarget(29);
  })();
})();
