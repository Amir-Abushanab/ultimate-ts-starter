import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Button,
  Card,
  Input,
  Spinner,
  Surface,
  TextField,
  useToast,
} from "heroui-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

const PAGE_SIZE = 15;

interface ExampleItem {
  createdAt: string;
  id: string;
  title: string;
}

const invalidateList = () =>
  queryClient.invalidateQueries({ queryKey: orpc.example.list.key() });

// Owns its own text state so typing doesn't re-render the whole list.
const CreateItemForm = ({
  isPending,
  onAdd,
}: {
  isPending: boolean;
  onAdd: (title: string) => void;
}) => {
  const [title, setTitle] = useState("");
  const trimmed = title.trim();

  const submit = () => {
    if (trimmed.length === 0) {
      return;
    }
    onAdd(trimmed);
    setTitle("");
  };

  return (
    <View className="flex-row items-end gap-2">
      <View className="flex-1">
        <TextField>
          <Input
            autoCapitalize="sentences"
            placeholder="New item title"
            returnKeyType="done"
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={submit}
          />
        </TextField>
      </View>
      <Button isDisabled={isPending || trimmed.length === 0} onPress={submit}>
        {isPending ? (
          <Spinner color="default" size="sm" />
        ) : (
          <Button.Label>Add</Button.Label>
        )}
      </Button>
    </View>
  );
};

// Owns its own edit/draft state so a row in edit mode is self-contained.
const ExampleRow = ({
  canMutate,
  isDeleting,
  isSaving,
  item,
  onDelete,
  onSave,
}: {
  canMutate: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  item: ExampleItem;
  onDelete: (id: string) => void;
  onSave: (id: string, title: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);

  if (isEditing) {
    const trimmed = draft.trim();
    return (
      <Card variant="secondary" className="p-3">
        <TextField>
          <Input
            autoFocus
            placeholder="Item title"
            value={draft}
            onChangeText={setDraft}
          />
        </TextField>
        <View className="flex-row justify-end gap-2 mt-3">
          <Button
            variant="ghost"
            onPress={() => {
              setIsEditing(false);
              setDraft(item.title);
            }}
          >
            <Button.Label>Cancel</Button.Label>
          </Button>
          <Button
            isDisabled={isSaving || trimmed.length === 0}
            onPress={() => {
              onSave(item.id, trimmed);
              setIsEditing(false);
            }}
          >
            {isSaving ? (
              <Spinner color="default" size="sm" />
            ) : (
              <Button.Label>Save</Button.Label>
            )}
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="secondary" className="p-3">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-foreground font-medium">{item.title}</Text>
          <Text className="text-muted text-xs mt-0.5">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Text>
        </View>
        {canMutate ? (
          <View className="flex-row gap-1">
            <Button
              variant="ghost"
              onPress={() => {
                setDraft(item.title);
                setIsEditing(true);
              }}
            >
              <Button.Label>Edit</Button.Label>
            </Button>
            <Button
              isDisabled={isDeleting}
              variant="ghost"
              onPress={() => {
                onDelete(item.id);
              }}
            >
              {isDeleting ? (
                <Spinner color="default" size="sm" />
              ) : (
                <Button.Label className="text-danger">Delete</Button.Label>
              )}
            </Button>
          </View>
        ) : null}
      </View>
    </Card>
  );
};

const Examples = () => {
  const { toast } = useToast();
  const { data: session } = authClient.useSession();
  const canMutate = Boolean(session?.user);

  const list = useInfiniteQuery(
    orpc.example.list.infiniteOptions({
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: undefined as string | undefined,
      input: (cursor: string | undefined) => ({ cursor, limit: PAGE_SIZE }),
    })
  );

  const items = list.data?.pages.flatMap((page) => page.items) ?? [];

  const onError = (error: Error) => {
    toast.show({ label: error.message, variant: "danger" });
  };

  const create = useMutation(
    orpc.example.create.mutationOptions({
      onError,
      onSuccess: () => {
        void invalidateList();
      },
    })
  );
  const update = useMutation(
    orpc.example.update.mutationOptions({
      onError,
      onSuccess: () => {
        void invalidateList();
      },
    })
  );
  const remove = useMutation(
    orpc.example.delete.mutationOptions({
      onError,
      onSuccess: () => {
        void invalidateList();
      },
    })
  );

  // Drive FlatList row re-renders when sign-in or a per-row mutation changes.
  const savingId = update.isPending ? update.variables?.id : undefined;
  const deletingId = remove.isPending ? remove.variables?.id : undefined;

  return (
    <Container isScrollable={false}>
      <FlatList
        contentContainerStyle={{ gap: 12, padding: 16 }}
        data={items}
        extraData={`${String(canMutate)}-${savingId ?? ""}-${deletingId ?? ""}`}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (list.hasNextPage && !list.isFetchingNextPage) {
            void list.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View className="gap-3 mb-1">
            <View>
              <Text className="text-3xl font-bold text-foreground">
                Examples
              </Text>
              <Text className="text-muted text-sm mt-1">
                CRUD over the shared oRPC example router
              </Text>
            </View>
            {canMutate ? (
              <CreateItemForm
                isPending={create.isPending}
                onAdd={(title) => {
                  create.mutate({ title });
                }}
              />
            ) : (
              <Surface variant="secondary" className="p-3 rounded-lg">
                <Text className="text-muted text-sm">
                  Sign in on the Home tab to add, edit, or delete items.
                </Text>
              </Surface>
            )}
          </View>
        }
        ListEmptyComponent={
          list.isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator />
            </View>
          ) : (
            <Text className="text-muted text-center py-10">No items yet.</Text>
          )
        }
        ListFooterComponent={
          list.isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ExampleRow
            canMutate={canMutate}
            isDeleting={deletingId === item.id}
            isSaving={savingId === item.id}
            item={item}
            onDelete={(id) => {
              remove.mutate({ id });
            }}
            onSave={(id, title) => {
              update.mutate({ id, title });
            }}
          />
        )}
      />
    </Container>
  );
};

export default Examples;
