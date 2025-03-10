/** Copyright (c) 2024, Tegon, all rights reserved. **/

import { useRouter } from 'next/router';
import React from 'react';
import { SessionAuth, signOut } from 'supertokens-auth-react/recipe/session';

import { AuthLayout } from 'common/layouts/auth-layout';
import { UserDataWrapper } from 'common/wrappers/user-data-wrapper';

import { AvatarText } from 'components/ui/avatar';
import { Button } from 'components/ui/button';
import { useToast } from 'components/ui/use-toast';

import { useInviteActionMutation } from 'services/workspace';

import { UserContext, type Invite } from 'store/user-context';

export function Invites() {
  const context = React.useContext(UserContext);
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: inviteAction, isLoading } = useInviteActionMutation({
    onSuccess: (data: Invite) => {
      if (data.status === 'ACCEPTED') {
        router.replace('/');
        toast({
          title: 'Invitation accepted',
          description: 'Current invitation for the workspace has been accepted',
        });
      }
    },
  });

  React.useEffect(() => {
    if (context?.workspaces.length > 0) {
      router.replace(`/${context.workspaces[0].slug}`);
    } else if (context?.invites.length === 0) {
      router.replace(`/waitlist`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.workspaces]);

  const onAction = (accept: boolean, inviteId: string) => {
    inviteAction({
      accept,
      inviteId,
    });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex flex-col min-w-[500px] bg-background-2 rounded p-4">
          <h2 className="text-lg"> Join the workspaces</h2>
          <p className="text-muted-foreground">
            You have been invited to these workspaces
          </p>

          <div className="flex flex-col gap-2 mt-2">
            {context.invites.map((invite: Invite) => {
              return (
                <div
                  key={invite.id}
                  className="bg-background-3 p-3 rounded flex justify-between items-center"
                >
                  <div className="flex gap-2">
                    <AvatarText text={invite.workspace.name} />
                    {invite.workspace.name}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      disabled={isLoading}
                      onClick={() => onAction(false, invite.id)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={isLoading}
                      onClick={() => onAction(true, invite.id)}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            await signOut();

            router.replace('/auth/signin');
          }}
        >
          Log out
        </Button>
      </div>
    </AuthLayout>
  );
}

Invites.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <SessionAuth>
      <UserDataWrapper>{page}</UserDataWrapper>
    </SessionAuth>
  );
};
