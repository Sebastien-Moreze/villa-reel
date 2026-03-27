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
  firstName: string;
};

export function ContactConfirmationEmail({ locale, firstName }: Props) {
  const isFr = locale === "fr";
  const subject = isFr
    ? "Nous avons bien reçu votre message"
    : "We have received your message";

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Header />
          <Section style={styles.section}>
            <Heading style={styles.title}>
              {isFr ? "Merci pour votre message" : "Thank you for your message"}
            </Heading>
            <Text style={styles.text}>
              {isFr
                ? `Bonjour ${firstName},`
                : `Hello ${firstName},`}
            </Text>
            <Text style={styles.text}>
              {isFr
                ? "Nous avons bien reçu votre demande concernant la Villa R.E.E.L. Nous revenons vers vous dans les plus brefs délais."
                : "We have received your request regarding Villa R.E.E.L. We will get back to you as soon as possible."}
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
  text: {
    fontSize: "13px",
    margin: "2px 0",
    color: "#374151",
    lineHeight: "1.5",
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

export default ContactConfirmationEmail;

