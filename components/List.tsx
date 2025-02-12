import React from "react";
import { LegendList } from "@legendapp/list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

export function List({ isLegend }: { isLegend: boolean }) {
  const ListComponent = isLegend ? LegendList : FlashList;

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["pokeapi"],
    staleTime: 0,
    queryFn: async ({ pageParam }) => {
      console.log("Call API", pageParam);

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=50&offset=${pageParam}`
      );

      const json = await response.json();

      // slow down the API
      await new Promise((resolve) => setTimeout(resolve, 5000));

      return json as {
        count: number;
        next: string | null;
        previous: string | null;
        results: {
          name: string;
          url: string;
        }[];
      };
    },
    initialPageParam: 0,
    getNextPageParam: (_lastPage, _allPages, lastPageParam) =>
      lastPageParam + 50,
  });

  const loadNextPage = (arg: number) => {
    // This is stale on Legend List
    console.log({ isFetchingNextPage, arg, isLegend });

    if (isFetchingNextPage) return;

    fetchNextPage();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!data ? (
        <ActivityIndicator color='white' />
      ) : (
        <ListComponent
          style={{ paddingHorizontal: 8, paddingVertical: 16 }}
          data={data?.pages.map((page) => page.results).flat()}
          estimatedItemSize={51}
          keyExtractor={(item) => item.url}
          onEndReached={() => loadNextPage(data.pages.length)}
          renderItem={({ item }) => (
            <View
              style={{
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 10,
                borderColor: "white",
                borderWidth: 1,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "white" }}>{item.name}</Text>
            </View>
          )}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}
