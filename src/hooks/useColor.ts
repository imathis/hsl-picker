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
  const { color, setColor, adjustColor, colorModels } = useColorStore();
  return { color, setColor, adjustColor, colorModels };
};
