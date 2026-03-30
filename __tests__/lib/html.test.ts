import { escapeHtml, escapeHtmlMultiline } from "@/lib/html";

describe("escapeHtml", () => {
  it("échappe les chevrons < et >", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;"
    );
  });

  it("échappe les guillemets doubles", () => {
    expect(escapeHtml('Il a dit "bonjour"')).toBe(
      "Il a dit &quot;bonjour&quot;"
    );
  });

  it("échappe les apostrophes", () => {
    expect(escapeHtml("l'hôtel")).toBe("l&#039;hôtel");
  });

  it("échappe les esperluettes &", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B");
  });

  it("gère null / undefined en renvoyant une chaîne vide", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("convertit les nombres en string", () => {
    expect(escapeHtml(42)).toBe("42");
  });

  it("laisse intact un texte sans caractères spéciaux", () => {
    expect(escapeHtml("Villa R.E.E.L")).toBe("Villa R.E.E.L");
  });

  it("gère une chaîne vide", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("échappe tous les caractères spéciaux combinés", () => {
    expect(escapeHtml(`<a href="x" onclick='alert("&")'>test</a>`)).toBe(
      '&lt;a href=&quot;x&quot; onclick=&#039;alert(&quot;&amp;&quot;)&#039;&gt;test&lt;/a&gt;'
    );
  });
});

describe("escapeHtmlMultiline", () => {
  it("convertit les sauts de ligne en <br />", () => {
    expect(escapeHtmlMultiline("Ligne 1\nLigne 2")).toBe(
      "Ligne 1<br />Ligne 2"
    );
  });

  it("échappe le HTML ET convertit les sauts de ligne", () => {
    expect(escapeHtmlMultiline("<b>gras</b>\nitalique")).toBe(
      "&lt;b&gt;gras&lt;/b&gt;<br />italique"
    );
  });

  it("gère les sauts de ligne multiples", () => {
    expect(escapeHtmlMultiline("a\n\nb")).toBe("a<br /><br />b");
  });

  it("gère null / undefined", () => {
    expect(escapeHtmlMultiline(null)).toBe("");
    expect(escapeHtmlMultiline(undefined)).toBe("");
  });
});
