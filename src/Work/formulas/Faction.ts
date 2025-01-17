import { AugmentationNames } from "../../Augmentation/data/AugmentationNames";
import { BitNodeMultipliers } from "../../BitNode/BitNodeMultipliers";
import { CONSTANTS } from "../../Constants";
import { IPlayer } from "../../PersonObjects/IPlayer";
import { FactionWorkType } from "../data/FactionWorkType";
import { newWorkStats, WorkStats } from "../WorkStats";

const gameCPS = 1000 / CONSTANTS._idleSpeed; // 5 cycles per second

export const FactionWorkStats: Record<FactionWorkType, WorkStats> = {
  [FactionWorkType.HACKING]: newWorkStats({ hackExp: 15 }),
  [FactionWorkType.FIELD]: newWorkStats({
    hackExp: 10,
    strExp: 10,
    defExp: 10,
    dexExp: 10,
    agiExp: 10,
    chaExp: 10,
  }),
  [FactionWorkType.SECURITY]: newWorkStats({
    hackExp: 5,
    strExp: 15,
    defExp: 15,
    dexExp: 15,
    agiExp: 15,
  }),
};

export function calculateFactionExp(player: IPlayer, tpe: FactionWorkType): WorkStats {
  let focusBonus = 1;
  if (!player.hasAugmentation(AugmentationNames.NeuroreceptorManager)) {
    focusBonus = player.focus ? 1 : CONSTANTS.BaseFocusBonus;
  }
  const baseStats = FactionWorkStats[tpe];
  return {
    money: 0,
    reputation: 0,
    hackExp:
      (focusBonus * (baseStats.hackExp * player.mults.hacking_exp * BitNodeMultipliers.FactionWorkExpGain)) / gameCPS,
    strExp:
      (focusBonus * (baseStats.strExp * player.mults.strength_exp * BitNodeMultipliers.FactionWorkExpGain)) / gameCPS,
    defExp:
      (focusBonus * (baseStats.defExp * player.mults.defense_exp * BitNodeMultipliers.FactionWorkExpGain)) / gameCPS,
    dexExp:
      (focusBonus * (baseStats.dexExp * player.mults.dexterity_exp * BitNodeMultipliers.FactionWorkExpGain)) / gameCPS,
    agiExp:
      (focusBonus * (baseStats.agiExp * player.mults.agility_exp * BitNodeMultipliers.FactionWorkExpGain)) / gameCPS,
    chaExp:
      (focusBonus * (baseStats.chaExp * player.mults.charisma_exp * BitNodeMultipliers.FactionWorkExpGain)) / gameCPS,
    intExp: 0,
  };
}
