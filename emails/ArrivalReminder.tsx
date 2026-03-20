import {
  Body,
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
  portalCode?: string;
  wifiName?: string;
  wifiPassword?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export function ArrivalReminderEmail({
  locale,
  confirmationCode,
  checkIn,
  portalCode,
  wifiName,
  wifiPassword,
  contactPhone,
  contactEmail,
}: Props) {
  const isFr = locale === "fr";
  const subject = isFr
    ? "Votre séjour commence dans 7 jours !"
    : "Your stay starts in 7 days!";

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
                ? "Votre séjour approche"
                : "Your stay is coming soon"}
            </Heading>
            <Text style={styles.text}>
              {isFr
                ? `Nous avons hâte de vous accueillir à la Villa R.E.E.L le ${checkIn}.`
                : `We look forward to welcoming you at Villa R.E.E.L on ${checkIn}.`}
            </Text>

            <Section style={styles.codeBox}>
              <Text style={styles.codeLabel}>
                {isFr ? "Code de confirmation" : "Confirmation code"}
              </Text>
              <Text style={styles.codeValue}>{confirmationCode}</Text>
            </Section>

            <Text style={styles.subTitle}>
              {isFr ? "Instructions d'accès" : "Access instructions"}
            </Text>
            {portalCode && (
              <Text style={styles.text}>
                {isFr
                  ? `Code portail : ${portalCode}`
                  : `Gate code: ${portalCode}`}
              </Text>
            )}

            {(wifiName || wifiPassword) && (
              <>
                <Text style={styles.subTitle}>
                  {isFr ? "Wi-Fi" : "Wi-Fi"}
                </Text>
                {wifiName && (
                  <Text style={styles.text}>
                    {isFr ? "Nom du réseau :" : "Network name:"} {wifiName}
                  </Text>
                )}
                {wifiPassword && (
                  <Text style={styles.text}>
                    {isFr ? "Mot de passe :" : "Password:"} {wifiPassword}
                  </Text>
                )}
              </>
            )}

            <Text style={styles.subTitle}>
              {isFr ? "Règlement intérieur" : "House rules"}
            </Text>
            <Text style={styles.text}>
              {isFr
                ? "Nous vous rappelons que le règlement intérieur de la villa est joint à vos emails de confirmation. Merci de le consulter avant votre arrivée."
                : "Please review the house rules attached to your confirmation emails before your arrival."}
            </Text>

            <Text style={styles.subTitle}>
              {isFr ? "Contact" : "Contact"}
            </Text>
            <Text style={styles.text}>
              {isFr
                ? "Pour toute question avant votre arrivée :"
                : "For any question before your arrival:"}
            </Text>
            {contactEmail && (
              <Text style={styles.text}>
                Email : <strong>{contactEmail}</strong>
              </Text>
            )}
            {contactPhone && (
              <Text style={styles.text}>
                {isFr ? "Téléphone :" : "Phone:"}{" "}
                <strong>{contactPhone}</strong>
              </Text>
            )}
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
        Villa R.E.E.L – 1281 route de Moussy, 74930 Reigner-Esery, France
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
    margin: "12px 0 6px",
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
    marginBottom: "10px",
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
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.25em",
    color: "#064e3b",
    marginTop: "6px",
    marginBottom: 0,
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

export default ArrivalReminderEmail;

