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
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export function ContactNotificationEmail({
  locale,
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
}: Props) {
  const isFr = locale === "fr";
  const preview = isFr
    ? "Nouveau message de contact Villa R.E.E.L"
    : "New contact message – Villa R.E.E.L";

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Header />
          <Section style={styles.section}>
            <Heading style={styles.title}>
              {isFr ? "Nouveau message de contact" : "New contact message"}
            </Heading>
            <Text style={styles.text}>
              {isFr
                ? "Vous avez reçu un nouveau message depuis le formulaire de contact du site."
                : "You have received a new message from the website contact form."}
            </Text>

            <Text style={styles.subTitle}>
              {isFr ? "Coordonnées" : "Contact details"}
            </Text>
            <Text style={styles.text}>
              {firstName} {lastName}
            </Text>
            <Text style={styles.text}>Email : {email}</Text>
            {phone && <Text style={styles.text}>Téléphone : {phone}</Text>}

            <Text style={styles.subTitle}>
              {isFr ? "Objet" : "Subject"}
            </Text>
            <Text style={styles.text}>{subject}</Text>

            <Text style={styles.subTitle}>
              {isFr ? "Message" : "Message"}
            </Text>
            <Text style={styles.text}>&quot;{message}&quot;</Text>
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
  subTitle: {
    fontSize: "14px",
    margin: "12px 0 4px",
    color: "#111827",
    fontWeight: 600,
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

export default ContactNotificationEmail;

