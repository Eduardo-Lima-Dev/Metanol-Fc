import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { EmptyState } from "../../../src/components/EmptyState";

export default function RachasList() {
  return (
    <ScreenContainer>
      <EmptyState
        title="Nenhum racha ainda"
        description="A lista de rachas será implementada na Fase 2."
      />
    </ScreenContainer>
  );
}
