// Root React Component for the Corporation UI
import React, { useState, useEffect } from "react";

import { Theme, useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import { numeralWrapper } from "../numeralFormat";
import { Reputation } from "./Reputation";
import { KillScriptsModal } from "./KillScriptsModal";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";
import ClearAllIcon from "@mui/icons-material/ClearAll";

import { Settings } from "../../Settings/Settings";
import { use } from "../Context";
import { StatsProgressOverviewCell } from "./StatsProgressBar";
import { BitNodeMultipliers } from "../../BitNode/BitNodeMultipliers";

import { Box, Tooltip } from "@mui/material";

import { isClassWork } from "../../Work/ClassWork";
import { CONSTANTS } from "../../Constants";
import { isCreateProgramWork } from "../../Work/CreateProgramWork";
import { isGraftingWork } from "../../Work/GraftingWork";
import { isFactionWork } from "../../Work/FactionWork";
import { ReputationRate } from "./ReputationRate";
import { isCompanyWork } from "../../Work/CompanyWork";
import { isCrimeWork } from "../../Work/CrimeWork";

interface IProps {
  save: () => void;
  killScripts: () => void;
}

function Intelligence(): React.ReactElement {
  const theme = useTheme();
  const player = use.Player();
  const classes = useStyles();
  if (player.intelligence === 0) return <></>;
  const progress = player.calculateSkillProgress(player.intelligence_exp);

  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row" classes={{ root: classes.cell }}>
          <Typography classes={{ root: classes.int }}>Int&nbsp;</Typography>
        </TableCell>
        <TableCell align="right" classes={{ root: classes.cell }}>
          <Typography classes={{ root: classes.int }}>{numeralWrapper.formatSkill(player.intelligence)}</Typography>
        </TableCell>
        <TableCell align="right" classes={{ root: classes.cell }}>
          <Typography id="overview-int-hook" classes={{ root: classes.int }}>
            {/*Hook for player scripts*/}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        {!Settings.DisableOverviewProgressBars && (
          <StatsProgressOverviewCell progress={progress} color={theme.colors.int} />
        )}
      </TableRow>
    </>
  );
}

function Bladeburner(): React.ReactElement {
  const player = use.Player();
  const classes = useStyles();
  const bladeburner = player.bladeburner;
  if (bladeburner === null) return <></>;
  const action = bladeburner.getTypeAndNameFromActionId(bladeburner.action);
  if (action.type === "Idle") return <></>;
  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row" colSpan={2} classes={{ root: classes.cellNone }}>
          <Typography>Bladeburner:</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell component="th" scope="row" colSpan={2} classes={{ root: classes.cellNone }}>
          <Typography>
            {action.type}: {action.name}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
}

interface WorkInProgressOverviewProps {
  tooltip: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  onClickFocus: () => void;
}

function WorkInProgressOverview({
  tooltip,
  children,
  onClickFocus,
  header,
}: WorkInProgressOverviewProps): React.ReactElement {
  const classes = useStyles();
  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row" colSpan={2} classes={{ root: classes.workCell }}>
          <Tooltip title={<>{tooltip}</>}>
            <Typography className={classes.workHeader} sx={{ pt: 1, pb: 0.5 }}>
              {header}
            </Typography>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell component="th" scope="row" colSpan={2} classes={{ root: classes.workCell }}>
          <Typography className={classes.workSubtitles}>{children}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell component="th" scope="row" align="center" colSpan={2} classes={{ root: classes.cellNone }}>
          <Button sx={{ mt: 1 }} onClick={onClickFocus}>
            Focus
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}

function Work(): React.ReactElement {
  const player = use.Player();
  const router = use.Router();
  const onClickFocus = (): void => {
    player.startFocusing();
    router.toWork();
  };
  if (player.currentWork === null || player.focus) return <></>;

  let details = <></>;
  let header = <></>;
  let innerText = <></>;
  if (isCrimeWork(player.currentWork)) {
    const crime = player.currentWork.getCrime();
    const perc = (player.currentWork.unitCompleted / crime.time) * 100;

    details = <>{player.currentWork.crimeType}</>;
    header = <>You are attempting to {player.currentWork.crimeType}</>;
    innerText = <>{perc.toFixed(2)}%</>;
  }
  if (isClassWork(player.currentWork)) {
    details = <>{player.currentWork.getClass().youAreCurrently}</>;
    header = <>You are {player.currentWork.getClass().youAreCurrently}</>;
    innerText = <>{convertTimeMsToTimeElapsedString(player.currentWork.cyclesWorked * CONSTANTS._idleSpeed)}</>;
  }
  if (isCreateProgramWork(player.currentWork)) {
    const create = player.currentWork;
    details = <>Coding {create.programName}</>;
    header = <>Creating a program</>;
    innerText = (
      <>
        {create.programName} {((create.unitCompleted / create.unitNeeded()) * 100).toFixed(2)}%
      </>
    );
  }
  if (isGraftingWork(player.currentWork)) {
    const graft = player.currentWork;
    details = <>Grafting {graft.augmentation}</>;
    header = <>Grafting an Augmentation</>;
    innerText = (
      <>
        <strong>{((graft.unitCompleted / graft.unitNeeded()) * 100).toFixed(2)}%</strong> done
      </>
    );
  }

  if (isFactionWork(player.currentWork)) {
    const factionWork = player.currentWork;
    header = (
      <>
        Working for <strong>{factionWork.factionName}</strong>
      </>
    );
    innerText = (
      <>
        <Reputation reputation={factionWork.getFaction().playerReputation} /> rep
        <br />(
        <ReputationRate reputation={factionWork.getReputationRate(player) * (1000 / CONSTANTS._idleSpeed)} />)
      </>
    );
  }
  if (isCompanyWork(player.currentWork)) {
    const companyWork = player.currentWork;
    details = (
      <>
        {player.jobs[companyWork.companyName]} at <strong>{companyWork.companyName}</strong>
      </>
    );
    header = (
      <>
        Working at <strong>{companyWork.companyName}</strong>
      </>
    );
    innerText = (
      <>
        <Reputation reputation={companyWork.getCompany().playerReputation} /> rep
        <br />(
        <ReputationRate reputation={companyWork.getGainRates(player).reputation * (1000 / CONSTANTS._idleSpeed)} />)
      </>
    );
  }

  return (
    <WorkInProgressOverview tooltip={details} header={header} onClickFocus={onClickFocus}>
      {innerText}
    </WorkInProgressOverview>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    workCell: {
      textAlign: "center",
      maxWidth: "200px",
      borderBottom: "none",
      padding: 0,
      margin: 0,
    },

    workHeader: {
      fontSize: "0.9rem",
    },

    workSubtitles: {
      fontSize: "0.8rem",
    },

    cellNone: {
      borderBottom: "none",
      padding: 0,
      margin: 0,
    },
    cell: {
      padding: 0,
      margin: 0,
    },
    hp: {
      color: theme.colors.hp,
    },
    money: {
      color: theme.colors.money,
    },
    hack: {
      color: theme.colors.hack,
    },
    combat: {
      color: theme.colors.combat,
    },
    cha: {
      color: theme.colors.cha,
    },
    int: {
      color: theme.colors.int,
    },
  }),
);

export { useStyles as characterOverviewStyles };

export function CharacterOverview({ save, killScripts }: IProps): React.ReactElement {
  const [killOpen, setKillOpen] = useState(false);
  const player = use.Player();

  const setRerender = useState(false)[1];

  useEffect(() => {
    const id = setInterval(() => setRerender((old) => !old), 600);
    return () => clearInterval(id);
  }, []);

  const classes = useStyles();
  const theme = useTheme();

  const hackingProgress = player.calculateSkillProgress(
    player.hacking_exp,
    player.mults.hacking * BitNodeMultipliers.HackingLevelMultiplier,
  );
  const strengthProgress = player.calculateSkillProgress(
    player.strength_exp,
    player.mults.strength * BitNodeMultipliers.StrengthLevelMultiplier,
  );
  const defenseProgress = player.calculateSkillProgress(
    player.defense_exp,
    player.mults.defense * BitNodeMultipliers.DefenseLevelMultiplier,
  );
  const dexterityProgress = player.calculateSkillProgress(
    player.dexterity_exp,
    player.mults.dexterity * BitNodeMultipliers.DexterityLevelMultiplier,
  );
  const agilityProgress = player.calculateSkillProgress(
    player.agility_exp,
    player.mults.agility * BitNodeMultipliers.AgilityLevelMultiplier,
  );
  const charismaProgress = player.calculateSkillProgress(
    player.charisma_exp,
    player.mults.charisma * BitNodeMultipliers.CharismaLevelMultiplier,
  );

  return (
    <>
      <Table sx={{ display: "block", m: 1 }}>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.hp }}>HP&nbsp;</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.hp }}>
                {numeralWrapper.formatHp(player.hp)}&nbsp;/&nbsp;{numeralWrapper.formatHp(player.max_hp)}
              </Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography id="overview-hp-hook" classes={{ root: classes.hp }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.money }}>Money&nbsp;</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.money }}>{numeralWrapper.formatMoney(player.money)}</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography id="overview-money-hook" classes={{ root: classes.money }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.hack }}>Hack&nbsp;</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.hack }}>{numeralWrapper.formatSkill(player.hacking)}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            {!Settings.DisableOverviewProgressBars && (
              <StatsProgressOverviewCell progress={hackingProgress} color={theme.colors.hack} />
            )}
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cell }}>
              <Typography classes={{ root: classes.hack }}></Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cell }}>
              <Typography id="overview-hack-hook" classes={{ root: classes.hack }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.combat }}>Str&nbsp;</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.combat }}>{numeralWrapper.formatSkill(player.strength)}</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography id="overview-str-hook" classes={{ root: classes.combat }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            {!Settings.DisableOverviewProgressBars && (
              <StatsProgressOverviewCell progress={strengthProgress} color={theme.colors.combat} />
            )}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.combat }}>Def&nbsp;</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.combat }}>{numeralWrapper.formatSkill(player.defense)}</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography id="overview-def-hook" classes={{ root: classes.combat }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            {!Settings.DisableOverviewProgressBars && (
              <StatsProgressOverviewCell progress={defenseProgress} color={theme.colors.combat} />
            )}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.combat }}>Dex&nbsp;</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.combat }}>{numeralWrapper.formatSkill(player.dexterity)}</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography id="overview-dex-hook" classes={{ root: classes.combat }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            {!Settings.DisableOverviewProgressBars && (
              <StatsProgressOverviewCell progress={dexterityProgress} color={theme.colors.combat} />
            )}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cell }}>
              <Typography classes={{ root: classes.combat }}>Agi&nbsp;</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cell }}>
              <Typography classes={{ root: classes.combat }}>{numeralWrapper.formatSkill(player.agility)}</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cell }}>
              <Typography id="overview-agi-hook" classes={{ root: classes.combat }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            {!Settings.DisableOverviewProgressBars && (
              <StatsProgressOverviewCell progress={agilityProgress} color={theme.colors.combat} />
            )}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.cha }}>Cha&nbsp;</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography classes={{ root: classes.cha }}>{numeralWrapper.formatSkill(player.charisma)}</Typography>
            </TableCell>
            <TableCell align="right" classes={{ root: classes.cellNone }}>
              <Typography id="overview-cha-hook" classes={{ root: classes.cha }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            {!Settings.DisableOverviewProgressBars && (
              <StatsProgressOverviewCell progress={charismaProgress} color={theme.colors.cha} />
            )}
          </TableRow>

          <Intelligence />

          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-0" classes={{ root: classes.hack }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
            <TableCell component="th" scope="row" align="right" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-1" classes={{ root: classes.hack }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
            <TableCell component="th" scope="row" align="right" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-2" classes={{ root: classes.hack }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
          </TableRow>
          <Work />
          <Bladeburner />
        </TableBody>
      </Table>
      <Box sx={{ display: "flex", borderTop: `1px solid ${Settings.theme.welllight}` }}>
        <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
          <IconButton aria-label="save game" onClick={save}>
            <Tooltip title={Settings.AutosaveInterval !== 0 ? "Save game" : "Save game (auto-saves are disabled!)"}>
              <SaveIcon color={Settings.AutosaveInterval !== 0 ? "primary" : "error"} />
            </Tooltip>
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
          <IconButton aria-label="kill all scripts" onClick={() => setKillOpen(true)}>
            <Tooltip title="Kill all running scripts">
              <ClearAllIcon color="error" />
            </Tooltip>
          </IconButton>
        </Box>
      </Box>
      <KillScriptsModal open={killOpen} onClose={() => setKillOpen(false)} killScripts={killScripts} />
    </>
  );
}
