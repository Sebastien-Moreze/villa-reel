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
  guestName: string;
  reviewUrl: string;
};

export function ReviewRequestEmail({ locale, guestName, reviewUrl }: Props) {
  const isFr = locale === "fr";
  const subject = isFr
    ? "Comment s'est passé votre séjour ?"
    : "How was your stay at Villa R.E.E.L?";

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
                ? "Un grand merci pour votre séjour"
                : "Thank you for staying with us"}
            </Heading>
            <Text style={styles.text}>
              {isFr
                ? `Bonjour ${guestName},`
                : `Hello ${guestName},`}
            </Text>
            <Text style={styles.text}>
              {isFr
                ? "Nous espérons que votre expérience à la Villa R.E.E.L a été à la hauteur de vos attentes."
                : "We hope your experience at Villa R.E.E.L met all your expectations."}
            </Text>
            <Text style={styles.text}>
              {isFr
                ? "Votre avis est précieux pour nous aider à améliorer la villa et à guider de futurs voyageurs."
                : "Your feedback is precious to help us improve the villa and guide future guests."}
            </Text>

            <Section style={{ marginTop: 18, textAlign: "center" }}>
              <a href={reviewUrl} style={styles.button}>
                {isFr
                  ? "Donner mon avis sur mon séjour"
                  : "Share your feedback"}
              </a>
            </Section>

            <Text style={{ ...styles.text, marginTop: 14 }}>
              {isFr
                ? "Le lien est personnel et utilisable une seule fois."
                : "The link is personal and can be used only once."}
            </Text>
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
        contact@villareel.fr • +33 (0)6 00 00 00 00
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
  text: {
    fontSize: "13px",
    margin: "2px 0",
    color: "#374151",
    lineHeight: "1.5",
  },
  button: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: "9999px",
    background:
      "linear-gradient(135deg, #f97316, #ec4899, #a855f7)",
    color: "#111827",
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

export default ReviewRequestEmail;

