/* eslint-disable dot-location */
/** Copyright (c) 2024, Tegon, all rights reserved. **/
import {
  type IAnyStateTreeNode,
  type Instance,
  types,
  flow,
} from 'mobx-state-tree';

import type { TeamType } from 'common/types/team';

import { tegonDatabase } from 'store/database';

import { Team } from './models';

export const TeamsStore: IAnyStateTreeNode = types
  .model({
    teams: types.array(Team),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (team: TeamType, id: string) => {
      const indexToUpdate = self.teams.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.teams[indexToUpdate] = {
          ...self.teams[indexToUpdate],
          ...team,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.teams.push(team);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.teams.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.teams.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const teams = yield tegonDatabase.teams.toArray();

      self.teams = teams;
    });

    return { update, deleteById, load };
  });

export type TeamsStoreType = Instance<typeof TeamsStore>;
