import cube from '@cubejs-client/core';

const cubeApi = cube(
  "d1c911fdb7984f933f2ed6454290c13703d371737305d39dba588faabaeed0581dee9d52c04650722f01097881614c39045a1f0e980385b677592665efffd0c1",
  { apiUrl: "http://localhost:4000/cubejs-api/v1" }
);

export default cubeApi;