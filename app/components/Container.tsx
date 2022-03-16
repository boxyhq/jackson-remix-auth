import Footer from "./Footer";

export default function Container(props: any) {
  const { children } = props;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <main>{children}</main>
      <Footer />
    </div>
  );
}
