import { db } from "../database";

type Group = { group_id: string };
type Channel = { channel: string };
type GroupParam = { $groupId: string };
type ChannelParam = { $channel: string };
type GroupChannelParam = GroupParam & ChannelParam;
const table = 'lineGroups';
const col = {
    group_id: 'group_id',
    channel: 'channel',
};
const columns = {
    [col.group_id]: ['TEXT'],
    [col.channel]: ['TEXT'],
};
const indexes = {
    [col.channel]: 'idx_channel',
};

class GroupRepository {

    constructor() {
        db.run(`
            CREATE TABLE IF NOT EXISTS ${table} (
                ${Object.entries(columns).map(([col, type]) => `${col} ${type.join(' ')}`).join(', ')},
                PRIMARY KEY (${col.group_id}, ${col.channel})
            );
        `);
        Object.entries(indexes).forEach(([col, name]) => {
            db.run(`CREATE INDEX IF NOT EXISTS ${name} ON ${table}(${col});`);
        });
    }

    delete(groupId: string): void {
        db.query<unknown, GroupParam>(`DELETE FROM ${table} WHERE ${col.group_id} = $groupId`).run({ $groupId: groupId });
    }

    get(groupId: string): Group | null {
        const res = db.query<Group, GroupParam>(
            `SELECT ${col.group_id} FROM ${table} WHERE ${col.group_id} = $groupId`
        );
        return res.get({ $groupId: groupId });
    }

    getFromChannel(channel: string): Group[] {
        return db.query<Group, ChannelParam>(`
            SELECT ${col.group_id} FROM ${table} WHERE ${col.channel} = $channel
        `).all({ $channel: channel });
    }

    hasChannel(groupId: string, channel: string): boolean {
        return !!db.query<Channel, GroupChannelParam>(
            `SELECT ${col.channel} FROM ${table} WHERE ${col.group_id} = $groupId AND ${col.channel} = $channel`
        ).get({ $groupId: groupId, $channel: channel });
    }

    getChannels(groupId: string): Channel[] {
        return db.query<Channel, GroupParam>(`
            SELECT ${col.channel} FROM ${table} WHERE ${col.group_id} = $groupId
        `).all({ $groupId: groupId });
    }

    private async _checkAndRun(groupId: string, channel: string, isDelete: boolean, query: string) {
        const stmt = db.query<undefined, GroupChannelParam>(query);
        return await new Promise((resolve) => {
            db.transaction((chanData: GroupChannelParam) => {
                console.log(isDelete, this.hasChannel(chanData.$groupId, chanData.$channel));
                if (isDelete == this.hasChannel(chanData.$groupId, chanData.$channel)) {
                    stmt.run(chanData);
                    resolve(true);
                } else
                    resolve(false);
            })({ $groupId: groupId, $channel: channel });
        })
    }

    async addChannel(groupId: string, channel: string) {
        return await this._checkAndRun(groupId, channel, false,
            `INSERT INTO ${table} (${col.group_id}, ${col.channel}) VALUES ($groupId, $channel)`
        );
    }

    async removeChannel(groupId: string, channel: string) {
        return await this._checkAndRun(groupId, channel, true,
            `DELETE FROM ${table} WHERE ${col.group_id} = $groupId AND ${col.channel} = $channel`
        );
    }
}

export const group = new GroupRepository();
