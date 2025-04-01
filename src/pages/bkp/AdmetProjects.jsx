import React from 'react';
import { useTable } from 'react-table';
import { FaEdit, FaTrash } from 'react-icons/fa';  // Import Font Awesome icons
import { Button } from 'ketcher-react';
import '../../styles/components.css'

const AdmetProjects = () => {
  const data = React.useMemo(
    () => [
      { col1: 'Project Name 1', col2: 'CEN123', col3: '17 May 2024', col4: 'Riyaz', col5: 'LoremIpsum', col6: '19 May 2024', col7: 'Row 1 Col 7' },
      { col1: 'Project Name 2', col2: 'CEN123', col3: '17 May 2024', col4: 'Riyaz', col5: 'LoremIpsum', col6: '19 May 2024', col7: 'Row 2 Col 7' },
      { col1: 'Project Name 3', col2: 'CEN123', col3: '17 May 2024', col4: 'Riyaz', col5: 'LoremIpsum', col6: '19 May 2024', col7: 'Row 3 Col 7' },
      { col1: 'Project Name 4', col2: 'CEN123', col3: '17 May 2024', col4: 'Riyaz', col5: 'LoremIpsum', col6: '19 May 2024', col7: 'Row 4 Col 7' },
      { col1: 'Project Name 5', col2: 'CEN123', col3: '17 May 2024', col4: 'Riyaz', col5: 'LoremIpsum', col6: '19 May 2024', col7: 'Row 5 Col 7' },
      { col1: 'Project Name 6', col2: 'CEN123', col3: '17 May 2024', col4: 'Riyaz', col5: 'LoremIpsum', col6: '19 May 2024', col7: 'Row 6 Col 7' },
      { col1: 'Project Name 7', col2: 'CEN123', col3: '17 May 2024', col4: 'Riyaz', col5: 'LoremIpsum', col6: '19 May 2024', col7: 'Row 7 Col 7'},
    ],
    []
  );

  const columns = React.useMemo(
    () => [
      { Header: 'Project Name', accessor: 'col1' },
      { Header: 'Project Id', accessor: 'col2' },
      { Header: 'Date Created', accessor: 'col3' },
      { Header: 'Participators', accessor: 'col4' },
      { Header: 'Description', accessor: 'col5' },
      { Header: 'Last Modified', accessor: 'col6' },
      {
        Header: 'Action',
        accessor: 'col7',
        Cell: ({ row }) => (
          <div style={{ display: 'flex' }}>
            <FaEdit style={{ cursor: 'pointer',  }} onClick={() => handleEdit(row.original)} />
            <FaTrash style={{ cursor: 'pointer',marginLeft:'20px' }} onClick={() => handleDelete(row.original)} />
          </div>
        )
      }
    ],
    []
  );

  const handleEdit = (row) => {
    // Handle edit action
    console.log('Edit row:', row);
  };

  const handleDelete = (row) => {
    // Handle delete action
    console.log('Delete row:', row);
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <>
    <div>
        <div className='flex justify-between'>
            <div className='total-projects'>Total Projects 06</div>
            <button className='create-project-btn'><span className='plus'>+</span>Create New</button>
        </div>
    <table  {...getTableProps()} style={{ borderCollapse: 'collapse', width: '100%',marginTop:'40px' }}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th
                {...column.getHeaderProps()}
                style={{
                  background: 'white',
                  color: 'black',
                  fontWeight: 'bold',
                  padding: '10px',
                  textAlign: 'left',
                }}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} style={{ background: i % 2 === 0 ? 'white' : '#c1c1c1' }}>
              {row.cells.map(cell => {
                return (
                  <td
                    {...cell.getCellProps()}
                    style={{
                      padding: '10px',
                      border: 'none',
                      textAlign: 'left',
                    }}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
    </>

  );
};

export default AdmetProjects;
