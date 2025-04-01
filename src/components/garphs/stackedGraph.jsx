
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,Surface, Symbols
} from "recharts";
import { TETooltip } from "tw-elements-react";

const data = [
  {
    name: "Jan",
    completed: 20,
    inprogress: 6,
    archived: 10,
    completed_total:50
  },
  {
    name: "Feb",
    completed: 15,
    inprogress: 8,
    archived: 2
  },
  {
    name: "Mar",
    completed: 24,
    inprogress: 9,
    archived: 8
  },
  {
    name: "Apr",
    completed: 18,
    inprogress: 10,
    archived: 3
  },
  {
    name: "May",
    completed: 11,
    inprogress: 9,
    archived: 11
  },
  {
    name: "Jun",
    completed: 24,
    inprogress: 10,
    archived: 7
  }
];

export default function StackedGraph() {
  return (
    <BarChart
      width={750}
      height={300}
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 0,
        bottom: 5
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend align="right" verticalAlign="center" iconType="circle" margin={{top: 0, left: 25, right: 0, bottom: 0}} layout="vertical" content={renderLegend} />
      <Bar dataKey="inprogress" label="In-Progress" stackId="a" fill="#9CBEC9"  />
      <Bar dataKey="completed" label="Completed" stackId="a" fill="#A6C697" />
      <Bar dataKey="archived" label="Archived" stackId="a" fill="#A09CBC" />
    </BarChart>
  );
}

const RoundedBar = (props) => {
  const { fill, x, y, width, height } = props;

  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};
const getPath = (x, y, width, height) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
  Z`;
};
const renderLegend = (props) => {
  const { payload } = props;
  // console.log(payload,data);
  return (
    <ul className="p-5">
      {
        payload.map((entry, index) => (
          
          <li className="py-2" key={`item-${index}`}><span className={`border px-1 rounded-full`} style={{backgroundColor:entry.color}}></span><span className="pl-2">{entry.payload.label}</span><br /><span className="p-2 text-2xl font-medium">{totalValue(entry.dataKey)}</span></li>
        ))
      }
    </ul>
  );
}
const totalValue=(prop)=>{
  let val=0
  data.forEach(e=>{
    // console.log(e,prop,e[prop]);
    val=val+e[prop]
  })
  return val
}
// {
//     const { payload } = props
//     return (
//       <div className="customized-legend">
//         {
//           payload.map((entry) => {
//             const { dataKey, color } = entry
//             let style = {}
//             if (dataKey == this.state.active) {
//               style = { backgroundColor: color , color: '#fff'}
//             }
//             return (
//               <TETooltip
//                 onClick={this.handleClick}
//                 key={`overlay-${dataKey}`}
//                 trigger={["hover", "focus"]}
//                 placement="top"
//                 overlay={this.renderPopoverTop(dataKey)}
//               >
//                 <span className="legend-item" onClick={this.handleClick} style={style}>
//                   <Surface width={10} height={10} viewBox="0 0 10 10" onClick={this.handleClick}>
//                     <Symbols cx={5} cy={5} type="circle" size={50} fill={color} onClick={this.handleClick} />
//                   </Surface>
//                   <span onClick={this.handleClick}>{dataKey}</span>
//                 </span>
//               </TETooltip>
//             )
//           })
//         }
//       </div>
//     )
//   }
