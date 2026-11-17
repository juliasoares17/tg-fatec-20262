import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { texto } from "@/constants/estilos";

type Props = {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
};

export function TelaAtividade({ titulo, onFechar, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white dark:bg-neutral-900 px-5"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <Text className={`text-2xl font-bold ${texto}`}>{titulo}</Text>
        <Pressable onPress={onFechar} className="px-3 py-1">
          <Text className="text-emerald-500 text-base">Fechar</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}