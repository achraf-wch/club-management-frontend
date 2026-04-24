import Navbar from '../../../Componenets/Navbar';
import Footer from '../../../Componenets/Footer';

const MemberLayout = ({ isDark, children }) => {
  return (
    <>
      <div className={`mem-root${isDark ? '' : ' light-mode'}`}>
        <div className="mem-orbs">
          <div className="mem-orb mem-orb-1" />
          <div className="mem-orb mem-orb-2" />
          <div className="mem-orb mem-orb-3" />
          <div className="mem-orb mem-orb-4" />
        </div>

        <Navbar />
        {children}
      </div>

      <Footer />
    </>
  );
};

export default MemberLayout;
