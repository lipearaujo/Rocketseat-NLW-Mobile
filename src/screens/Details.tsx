import { useState, useEffect } from "react";
import { Share } from 'react-native';
import { VStack, useToast, HStack } from "native-base";
import { useRoute } from "@react-navigation/native";

import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { PoolCardProps } from "../components/PoolCard";
import { PoolHeader } from "../components/PoolHeader";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { Option } from './../components/Option';

import { api } from "./../services/api";
import { Guesses } from "../components/Guesses";

interface RouteParams {
  id: string;
}

export function Details() {
  const [isLoading, setIsLoading] = useState(true);
  const [optionSelected, setOptionSelected] = useState<'Seus Palpites' | 'Ranking do grupo'>('Seus Palpites')
  const [poolDetails, setPoolDetails] = useState<PoolCardProps>(
    {} as PoolCardProps
  );

  const toast = useToast();
  const route = useRoute();

  const { id } = route.params as RouteParams;

  async function fetchPoolDetails() {
    try {
      setIsLoading(true);

      const response = await api.get(`/pools/${id}`);
      setPoolDetails(response.data.pool);

    } catch (error) {
      console.log(error);

      toast.show({
        title: "Não foi possível carregar os detalhes do bolão",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCodeShare() {
    await Share.share({
        message: poolDetails.code
    })
  }

  useEffect(() => {
    fetchPoolDetails();
  }, [id]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title={poolDetails.title} showBackButton showShareButton onShare={handleCodeShare}/>

      {poolDetails._count?.participants > 0 ? (
        <VStack>
          <PoolHeader data={poolDetails} />

          <HStack bgColor="gray.800" p={1} rounded="sm" mb={5} >
            <Option title="Seus Palpites" isSelected={optionSelected === 'Seus Palpites'} onPress={() => setOptionSelected('Seus Palpites')}/>
            <Option title="Ranking do grupo" isSelected={optionSelected === 'Ranking do grupo'} onPress={() => setOptionSelected('Ranking do grupo')}/>
          </HStack>

          <Guesses poolId={poolDetails.id} code={poolDetails.code}/>
        </VStack>
      ) : (
        <EmptyMyPoolList code={poolDetails.code} />
      )}
    </VStack>
  );
}
