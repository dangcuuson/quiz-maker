import { Table, TableBody, TableCell, TableHead, TableRow } from '@aws-amplify/ui-react';
import { ScoreListItemFragment } from '@gql/graphql';
import React from 'react';

interface Props {
    items: ScoreListItemFragment[];
}
const ScoresTable: React.FC<Props> = ({ items }) => {
    return (
        <Table caption="" highlightOnHover={false}>
            <TableHead backgroundColor="background.quaternary">
                <TableRow>
                    <TableCell as="th">User</TableCell>
                    <TableCell as="th">Score</TableCell>
                    <TableCell as="th">Time</TableCell>
                    <TableCell as="th">Quiz</TableCell>
                </TableRow>
            </TableHead>
            <TableBody backgroundColor="background.secondary">
                {items.map((row, index) => {
                    return <ScoresTableRow key={index} data={row} />;
                })}
            </TableBody>
        </Table>
    );
};

// score table could grow with many items => use React.memo to avoid re-render on existing rows
interface RowProps {
    data: ScoreListItemFragment;
}
const ScoresTableRow: React.FC<RowProps> = React.memo(({ data }) => {
    return (
        <TableRow>
            <TableCell as="th" title={data.username}>
                {data.userNickname}
            </TableCell>
            <TableCell as="th">{data.nCorrect}/{data.nQuestions}</TableCell>
            <TableCell as="th" title={data.createdAt}>{new Intl.DateTimeFormat('en-GB').format(new Date(data.createdAt))}</TableCell>
            <TableCell as="th">{data.quizCode}</TableCell>
        </TableRow>
    );
}, (props1, props2) => {
    const getPropsId = (props: RowProps): string => {
        const { userNickname, username, createdAt, quizCode } = props.data;
        return [userNickname, username, createdAt, quizCode].join('\n');
    }
    return getPropsId(props1) === getPropsId(props2);
});

export default ScoresTable;
