const DetailsTable = ({
    data,
}: {
    data: { label: string; value: string | number }[];
}) => {
    return (
        <table>
            <tbody>
                {data.map((item) => (
                    <tr key={item.label}>
                        <td>{item.label}:</td>
                        <td>{item.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DetailsTable;
