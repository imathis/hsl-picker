import { ColorModel, ColorObject } from "../types";
import { useColorStore } from "../utils/colorStore";

export interface ColorContextType {
  colorModels: ColorModel;
  color: ColorObject | null;
  setColor: (c: string | ColorObject) => ColorObject | null;
  adjustColor: (args: {
    [key: string]: string;
    model: keyof ColorModel | "hex";
  }) => ColorObject | null;
}

export const useColor = (): ColorContextType => {
  const colorModels = useColorStore((state) => state.colorModels);
  const setColor = useColorStore((state) => state.setColor);
  const adjustColor = useColorStore((state) => state.adjustColor);
  const getColorObject = useColorStore((state) => state.getColorObject);

  return {
    colorModels,
    color: getColorObject(),
    setColor: (c: string | ColorObject) => {
      setColor(c);
      return getColorObject();
    },
    adjustColor: (args: {
      [key: string]: string;
      model: keyof ColorModel | "hex";
    }) => {
      adjustColor(args);
      return getColorObject();
    },
  };
};
