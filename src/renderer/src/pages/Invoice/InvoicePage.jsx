const InvoicePage = () => {
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     console.log(e.key);
  //     if (e.ctrlKey && e.key.toLowerCase() === "f") {
  //       e.preventDefault();
  //       navigate("/pos");
  //     } else if (e.ctrlKey && e.key.toLowerCase() === "m") {
  //       e.preventDefault();
  //       navigate("/credit");
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  return (
    <main>
      <div className=" flex   ">
        {/* <Card title="إنشاء فاتورة" description="ctlr + f" />
        <Card title="عمل مصروف" description="ctlr + m" /> */}
      </div>
    </main>
  );
};

export default InvoicePage;
