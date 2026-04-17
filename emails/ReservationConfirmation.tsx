import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Heading,
} from "@react-email/components";

type Props = {
  locale: "fr" | "en";
  confirmationCode: string;
  checkIn: string;
  checkOut: string;
  villaName: string;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  balanceDueDate: string;
};

export function ReservationConfirmationEmail({
  locale,
  confirmationCode,
  checkIn,
  checkOut,
  villaName,
  totalAmount,
  depositAmount,
  balanceAmount,
  balanceDueDate,
}: Props) {
  const isFr = locale === "fr";
  const subject = isFr
    ? "Votre réservation Villa R.E.E.L est confirmée !"
    : "Your Villa R.E.E.L reservation is confirmed!";

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Header />

          <Section style={styles.section}>
            <Heading style={styles.title}>
              {isFr
                ? "Merci pour votre confiance."
                : "Thank you for your trust."}
            </Heading>
            <Text style={styles.text}>
              {isFr
                ? "Votre réservation à la Villa R.E.E.L est confirmée."
                : "Your stay at Villa R.E.E.L is confirmed."}
            </Text>

            <Section style={styles.codeBox}>
              <Text style={styles.codeLabel}>
                {isFr ? "Code de confirmation" : "Confirmation code"}
              </Text>
              <Text style={styles.codeValue}>{confirmationCode}</Text>
            </Section>

            <Section style={styles.section}>
              <Text style={styles.subTitle}>
                {isFr ? "Récapitulatif du séjour" : "Stay summary"}
              </Text>
              <Text style={styles.text}>
                {isFr ? "Villa :" : "Villa:"} {villaName}
              </Text>
              <Text style={styles.text}>
                {isFr ? "Arrivée :" : "Check-in:"} {checkIn}
              </Text>
              <Text style={styles.text}>
                {isFr ? "Départ :" : "Check-out:"} {checkOut}
              </Text>
              <Text style={styles.text}>
                {isFr ? "Total du séjour :" : "Total amount:"}{" "}
                <strong>{totalAmount} €</strong>
              </Text>
              <Text style={styles.text}>
                {isFr ? "Acompte réglé :" : "Deposit paid:"}{" "}
                <strong>{depositAmount} €</strong>
              </Text>
              <Text style={styles.text}>
                {isFr ? "Solde restant :" : "Remaining balance:"}{" "}
                <strong>{balanceAmount} €</strong>
              </Text>
            </Section>

            <Section style={styles.section}>
              <Text style={styles.subTitle}>
                {isFr ? "Prochaine étape" : "Next step"}
              </Text>
              <Text style={styles.text}>
                {isFr
                  ? `Le solde de votre séjour sera à régler au plus tard le ${balanceDueDate}. Vous recevrez un email avec un lien de paiement sécurisé 30 jours avant votre arrivée.`
                  : `The remaining balance is due by ${balanceDueDate}. You will receive an email with a secure payment link 30 days before your arrival.`}
              </Text>
            </Section>

            <Section style={{ ...styles.section, paddingTop: 0 }}>
              <Text style={styles.subTitle}>
                {isFr ? "Règlement intérieur" : "House rules"}
              </Text>
              <Text style={styles.text}>
                {isFr
                  ? "Nous vous invitons à consulter le règlement intérieur avant votre arrivée."
                  : "Please review the villa house rules before your arrival."}
              </Text>
              <Section style={{ marginTop: 14, textAlign: "center" as const }}>
                <Button
                  href={`https://villareel.com/${locale}/reglement-interieur`}
                  style={styles.button}
                >
                  {isFr ? "Lire le règlement intérieur" : "Read house rules"}
                </Button>
              </Section>
            </Section>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

function Header() {
  return (
    <Section style={styles.header}>
      <Text style={styles.logoTop}>VILLA</Text>
      <Text style={styles.logoBottom}>R.E.E.L</Text>
    </Section>
  );
}

function Footer() {
  return (
    <Section style={styles.footer}>
      <Text style={styles.footerText}>
        Villa R.E.E.L – Reignier-Esery, Haute-Savoie, France
      </Text>
      <Text style={styles.footerText}>
        contact@villareel.com • +33 (0)6 88 42 30 52 / +33 (0)6 80 21 51 57
      </Text>
    </Section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f3f4f6",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: {
    margin: "0 auto",
    padding: "32px 16px",
    maxWidth: "600px",
  },
  header: {
    background:
      "linear-gradient(135deg, #047857, #059669, #0d9488)",
    borderRadius: "16px 16px 0 0",
    padding: "20px",
    textAlign: "center" as const,
  },
  logoTop: {
    fontSize: "10px",
    letterSpacing: "0.35em",
    color: "#bbf7d0",
    margin: 0,
    textTransform: "uppercase" as const,
  },
  logoBottom: {
    fontSize: "11px",
    letterSpacing: "0.4em",
    color: "#ecfdf5",
    marginTop: "4px",
    marginBottom: 0,
  },
  section: {
    backgroundColor: "#ffffff",
    padding: "20px 22px",
  },
  title: {
    fontSize: "18px",
    margin: "0 0 8px",
    color: "#111827",
  },
  subTitle: {
    fontSize: "14px",
    margin: "12px 0 8px",
    color: "#111827",
    fontWeight: 600,
  },
  text: {
    fontSize: "13px",
    margin: "2px 0",
    color: "#374151",
    lineHeight: "1.5",
  },
  codeBox: {
    marginTop: "16px",
    padding: "14px 16px",
    borderRadius: "12px",
    backgroundColor: "#ecfdf5",
  },
  codeLabel: {
    fontSize: "11px",
    color: "#047857",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    margin: 0,
  },
  codeValue: {
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "0.25em",
    color: "#064e3b",
    marginTop: "6px",
    marginBottom: 0,
  },
  button: {
    display: "inline-block",
    padding: "10px 20px",
    borderRadius: "9999px",
    background: "linear-gradient(135deg, #047857, #059669)",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 600,
  },
  footer: {
    backgroundColor: "#111827",
    borderRadius: "0 0 16px 16px",
    padding: "14px 18px",
    textAlign: "center" as const,
  },
  footerText: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: "2px 0",
  },
};

export default ReservationConfirmationEmail;

