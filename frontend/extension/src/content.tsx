import React, { useEffect } from "react";
import { useMessage } from '@plasmohq/messaging/hook';


interface msgBody {
  type: string;
  data: string;
}

const CustomButton = () => {
  const [visible, setVisible] = React.useState(false);
  const { data } = useMessage<string, string>(async (req, res) => {
    if (req.name === 'toggleSearchOverlay') {
      setVisible(true);
    }
  })
  useEffect(() => {
  },[]);

  return visible && <button>Custom button</button>;
};

// export type PlasmoCSUIAnchor = {
//   type:  "inline",
//   element: Element
// }

export default CustomButton;
