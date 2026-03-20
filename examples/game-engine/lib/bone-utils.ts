export function resetBoneScales(object: any) {
  object.traverse((node: any) => {
    if (node.isBone) {
      node.scale.set(1, 1, 1);
    }
  });
}
