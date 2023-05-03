import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ElectionCard from "component/ElectionCard";
import LoadingButton from "component/LoadingButton";
import {
  Election,
  Maybe,
} from "types";
import router from "next/router";
import Loading from "component/Loading";

interface ElectionReviewProps {
  election: Maybe<Election>;
  onCancel(): void;
  viewOnly?: boolean;
}

export default function ElectionReview({
  election,
  onCancel,
  viewOnly = false
}: ElectionReviewProps) {

  const disableOpenElection = !election?.votersSet || !election?.testComplete;

  const handleOpenElection = () => {
    router.push(
      `/elections/${(election as Election)?.electionId}/open-live`
    );
  }

  const actions = (
    <Grid container justifyContent="center" spacing={2} alignItems="flex-end">
      <Grid item xs={4} sm={4} md={3}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Grid>
      <Grid item xs={4} sm={4} md={3}>
        <Button
          endIcon={<CheckIcon />}
          disabled={disableOpenElection}
          onClick={handleOpenElection}
        >
          Open Election
        </Button>
      </Grid>
    </Grid>
  );

  const formFields = (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h3">Review Your Election.</Typography>
      </Grid>
      <Grid item xs={12}>
        <ElectionCard election={election as Election} />
      </Grid>
    </Grid>
  )
  
  return (
    <>
      {election && (
        <Grid container direction="column" spacing={4} sx={{ minHeight: "100%" }}>
          <Grid item flexGrow={1}>{formFields}</Grid>
          {!viewOnly && <Grid item>{actions}</Grid>}
        </Grid>
      )}
    </>
  );
}