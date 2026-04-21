import { Card } from "heroui-native";
import { View } from "react-native";

import { Container } from "@/components/container";

const Home = () => (
  <Container className="p-6">
    <View className="flex-1 justify-center items-center">
      <Card variant="secondary" className="p-8 items-center">
        <Card.Title className="text-3xl mb-2">Tab One</Card.Title>
      </Card>
    </View>
  </Container>
);

export default Home;
