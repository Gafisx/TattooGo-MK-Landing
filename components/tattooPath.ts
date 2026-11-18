import type { MutableRefObject } from "react";
import type { Mesh, Vector3 } from "three";

export type TattooPath = {
  mesh: Mesh;
  center: Vector3;
  tangent: Vector3;
  normal: Vector3;
  length: number;
};

export type TattooPathRef = MutableRefObject<TattooPath | null>;
